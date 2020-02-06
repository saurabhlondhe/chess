import React from "react";

import { Button } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";

import io from "socket.io-client";
import { socket } from "../../constants/appConstants";
import FloatingOptions from "../_shared/FloatingOption/FloatingOptions";
import Board from "../board.js";
import FallenSoldierBlock from "../fallen-soldier-block.js";
import "../../index.css";
import "./game.styles.css";

import initialiseChessBoard, {
  reinitializeBoard
} from "../../helpers/board-initialiser.js";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class Game extends React.Component {
  constructor() {
    super();
    this.state = {
      squares: initialiseChessBoard(),
      currurentBoardState: [],
      whiteFallenSoldiers: [],
      blackFallenSoldiers: [],
      player: 1,
      sourceSelection: -1,
      status: "",
      turn: "white",
      open: false,
      hostedCode: null
    };
    this.amIWhite = null;
    this.socketIO = io(socket);
    this.socketIO.on("message", data => {
      const { squares, ...propsData } = data;
      this.setState({
        ...propsData,
        squares: reinitializeBoard(squares)
      });
    });
    this.socketIO.on("connect", () => console.log("connected"));

    // setInterval(() => {
    //   if (this.state.turn === "white") {
    //     this.setState({
    //       time: {
    //         white: this.state.time.white + 1,
    //         black: this.state.time.black
    //       }
    //     });
    //   } else {
    //     this.setState({
    //       time: {
    //         white: this.state.time.white,
    //         black: this.state.time.black + 1
    //       }
    //     });
    //   }
    // }, 1000);
  }
  createConnection = () => {
    this.socket.onmessage = s => {
      const { squares, ...propsData } = JSON.parse(s.data);
      this.setState({
        ...propsData,
        squares: reinitializeBoard(squares)
      });
    };
  };

  // componentDidUpdate = () => {
  //   if (this.socket) {
  //     this.socket.onmessage = s => {
  //       // console.log(s.data);

  //       const { squares, ...propsData } = JSON.parse(s.data);
  //       this.setState({
  //         ...propsData,
  //         squares: reinitializeBoard(squares)
  //       });
  //     };
  //   }
  // };
  sendBoardState = () => {
    localStorage.setItem(
      "prevMatch",
      JSON.stringify({
        turn: this.state.turn,
        player: this.state.player,
        squares: this.state.squares,
        whiteDeads: this.state.whiteFallenSoldiers,
        blackDeads: this.state.blackFallenSoldiers
      })
    );
    this.setState({ currurentBoardState: this.state.squares });
  };

  getBoardState = () => {
    if (this.state.currurentBoardState.length) {
      this.setState({ squares: this.state.currurentBoardState });
    } else {
      const obj = JSON.parse(localStorage.getItem("prevMatch"));
      this.setState({
        turn: obj.turn,
        player: obj.player,
        squares: reinitializeBoard(obj.squares),
        whiteFallenSoldiers: obj.whiteDeads,
        blackFallenSoldiers: obj.blackDeads
      });
    }
  };

  handleClick = i => {
    const squares = this.state.squares.slice();

    if (this.state.sourceSelection === -1) {
      if (!squares[i] || squares[i].player !== this.state.player) {
        this.setState({
          status:
            "Wrong selection. Choose player " + this.state.player + " pieces."
        });
        if (squares[i]) {
          squares[i].style = { ...squares[i].style, backgroundColor: "" };
        }
      } else {
        squares[i].style = {
          ...squares[i].style,
          backgroundColor: "RGB(111,143,114)"
        }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html
        this.setState({
          status: "Choose destination for the selected piece",
          sourceSelection: i
        });
      }
    } else if (this.state.sourceSelection > -1) {
      squares[this.state.sourceSelection].style = {
        ...squares[this.state.sourceSelection].style,
        backgroundColor: ""
      };
      if (squares[i] && squares[i].player === this.state.player) {
        this.setState({
          status: "Wrong selection. Choose valid source and destination again.",
          sourceSelection: -1
        });
      } else {
        const squares = this.state.squares.slice();
        const whiteFallenSoldiers = this.state.whiteFallenSoldiers.slice();
        const blackFallenSoldiers = this.state.blackFallenSoldiers.slice();
        const isDestEnemyOccupied = squares[i] ? true : false;
        const isMovePossible = squares[
          this.state.sourceSelection
        ].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied);
        const srcToDestPath = squares[
          this.state.sourceSelection
        ].getSrcToDestPath(this.state.sourceSelection, i);
        const isMoveLegal = this.isMoveLegal(srcToDestPath);

        if (isMovePossible && isMoveLegal) {
          if (squares[i] !== null) {
            if (squares[i].player === 1) {
              whiteFallenSoldiers.push(squares[i]);
            } else {
              blackFallenSoldiers.push(squares[i]);
            }
          }
          squares[i] = squares[this.state.sourceSelection];
          squares[this.state.sourceSelection] = null;
          let player = this.state.player === 1 ? 2 : 1;
          let turn = this.state.turn === "white" ? "black" : "white";
          const status = {
            sourceSelection: -1,
            squares: squares,
            whiteFallenSoldiers: whiteFallenSoldiers,
            blackFallenSoldiers: blackFallenSoldiers,
            player: player,
            status: "",
            turn: turn
          };
          this.setState(status);
          this.socketIO.send(status);
        } else {
          this.setState({
            status:
              "Wrong selection. Choose valid source and destination again.",
            sourceSelection: -1
          });
        }
      }
    }
  };

  /**
   * Check all path indices are null. For one steps move of pawn/others or jumping moves of knight array is empty, so  move is legal.
   * @param  {[type]}  srcToDestPath [array of board indices comprising path between src and dest ]
   * @return {Boolean}
   */
  isMoveLegal = srcToDestPath => {
    let isLegal = true;
    for (let i = 0; i < srcToDestPath.length; i++) {
      if (this.state.squares[srcToDestPath[i]] !== null) {
        isLegal = false;
      }
    }
    return isLegal;
  };
  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render = () => {
    return (
      <div>
        <h1 style={{ color: this.state.turn }} className="header">
          Chess
        </h1>

        <div className="game">
          <div className="game-board">
            <Board
              // isMyTurn={localStorage.getItem("player") !== this.state.turn}
              squares={this.state.squares}
              onClick={i => this.handleClick(i)}
            />
          </div>
        </div>
        <div className="fallen-soldier-block">
          {
            <FallenSoldierBlock
              whiteFallenSoldiers={this.state.whiteFallenSoldiers}
              blackFallenSoldiers={this.state.blackFallenSoldiers}
            />
          }
        </div>
        <div className="game-status">{this.state.status}</div>
        <div className={"player-turn-box " + this.state.turn}></div>
        <FloatingOptions></FloatingOptions>
        <Dialog
          open={this.state.open}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            Your game hosted succesfully
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {this.state.hostedCode}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Close
            </Button>
            <Button onClick={this.handleClose} color="primary">
              Copy
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  };
}

export default Game;
