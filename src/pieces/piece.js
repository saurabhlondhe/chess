class Piece {
  constructor(name, player, iconUrl) {
    this.name = name;
    this.player = player;
    this.style = {
      backgroundImage: "url('" + iconUrl + "')",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center"
    };
  }
}
export default Piece;
