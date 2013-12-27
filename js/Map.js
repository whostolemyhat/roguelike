function Map(rows, cols) {
    this.rows = rows;
    this.cols = cols;

    return this.init();
}

Map.prototype.init = function() {
    var map = [];
    for(var y = 0; y < this.rows; y++) {
        var newRow = [];
        for(var x = 0; x < this.cols; x++) {
            if(Math.random() > 0.8) {
                newRow.push('#');
            } else {
                newRow.push('.');
            }
        }
        map.push(newRow);
    }

    return map;
};
