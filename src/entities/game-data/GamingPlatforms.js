/** Enum representing supported platforms by the game */
class GamingPlatforms {
  /**
   * @param {string} id Platform ID
   * @param {string} name
   */
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  static PC = new GamingPlatforms(1, 'PC');
  static XBOX = new GamingPlatforms(2, 'Xbox');
  static PLAYSTATION = new GamingPlatforms(3, 'PlayStation');

  static values() {
    return Object.values(GamingPlatforms).filter(
      (v) => v instanceof GamingPlatforms
    );
  }
}

module.exports = GamingPlatforms;
