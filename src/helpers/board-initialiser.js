import Bishop from "../pieces/bishop.js";
import King from "../pieces/king.js";
import Knight from "../pieces/knight.js";
import Pawn from "../pieces/pawn.js";
import Queen from "../pieces/queen.js";
import Rook from "../pieces/rook.js";
import { Pieces } from "../constants/Pieces";

const initialiseChessBoard = () => {
  const squares = Array(64).fill(null);

  for (let i = 8; i < 16; i++) {
    squares[i] = new Pawn(2);
    squares[i + 40] = new Pawn(1);
  }
  squares[0] = new Rook(2);
  squares[7] = new Rook(2);
  squares[56] = new Rook(1);
  squares[63] = new Rook(1);

  squares[1] = new Knight(2);
  squares[6] = new Knight(2);
  squares[57] = new Knight(1);
  squares[62] = new Knight(1);

  squares[2] = new Bishop(2);
  squares[5] = new Bishop(2);
  squares[58] = new Bishop(1);
  squares[61] = new Bishop(1);

  squares[3] = new Queen(2);
  squares[4] = new King(2);

  squares[59] = new Queen(1);
  squares[60] = new King(1);

  return squares;
};

const getObject = element => {
  switch (element.name) {
    case Pieces.Pawn:
      return new Pawn(element.player);
    case Pieces.Bishop:
      return new Bishop(element.player);
    case Pieces.King:
      return new King(element.player);
    case Pieces.Queen:
      return new Queen(element.player);
    case Pieces.Knight:
      return new Knight(element.player);
    case Pieces.Rook:
      return new Rook(element.player);
    default:
      break;
  }
};
export const reinitializeBoard = squares => {
  let regeneratedSquares = [];
  squares.forEach(element => {
    regeneratedSquares.push(element ? getObject(element) : null);
  });
  return regeneratedSquares;
};

export default initialiseChessBoard;
