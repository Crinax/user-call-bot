const fs = require('fs');

class Structure {
  constructor(filename) {
    this._filename = filename;
    this._data = undefined;
  }

  filename;

  save() {
    fs.writeFileSync(this._filename, JSON.stringify(this._data));

    return this;
  }

  load() {
    const data = fs.readFileSync(this._filename);

    this._data = JSON.parse(data.toString());

    return this;
  }

  get data() {
    return this._data;
  }

  set data(newData) {
    this._data = newData;
  }
}

module.exports = Structure;