(function() {
    
    var sign = new RegExp('(\\+|\\-)?'),
        lox = new RegExp('([A-Za-z]+)'),
        col = new RegExp('([1-9]\\d*)'),
        term = new RegExp('(\\!)'),
        slox = new RegExp(sign.source + lox.source),
        scol = new RegExp(sign.source + col.source),
        sterm = new RegExp(sign.source + term.source),
        marker = new RegExp(sign.source + '(' + lox.source + '|' + col.source + '|' + term.source + ')'),
        exp = new RegExp('^\\s*(' + marker.source + '\\s+)*' + marker.source + '?$');
            
    var seq = function(seqString) {
    
        if (!(this instanceof seq)) {
            return new Sequence(seqString);
        }
        
        var that = this;

        this.sequence = "";        
        this.elements = [];

        // parse sequence
        this.parse(seqString);
        
        this.API = function() { 
            
            this.toArray  = function() {
                return that.elements;
            };
            
            this.getPermutations = function() {
                return that.getPermutations();
            };
            
            this.evaluate = function() {
                return that.evaluate();
            };
            
            this.normalize = function() {
                return that.normalize();
            };
        };
        
        this.API.prototype.toString = function() {
             return that.sequence;
        };
        

        this.API.prototype.equals = function(seq) {
            if (seq instanceof Sequence) {
                return false;
            }
            
            return that.sequence == seq.toString();
        }; 
        
        
        return new this.API();
    
    };

    seq.prototype.hasSign = function(symbol) {
        return symbol.length > 0 && 
            (symbol.indexOf("+") > -1 || symbol.indexOf("-") > -1);
    };
    
    seq.prototype.parse = function(seqString) {
        
        if (!seqString.match(exp)) {
            this.sequence = "";
        } else {
            // transform into an array
            var pre_elements = seqString.split(" ");
                        
            // replace A's, 1's and !'s to +A, +1 and +!
            for (var e in pre_elements) {
                
                // don't process empty strings
                if (pre_elements[e] === "")
                    continue;
                var symbol = (!this.hasSign(pre_elements[e]) ? "+" : "") + pre_elements[e].trim() + " ";
                
                var elem = {
                    symbol   : symbol.substring(1, symbol.length-1),
                    sign     :   (symbol.indexOf('+') > -1) ? '+' : '-',
                    isLox    : (symbol.match(slox)) ? true : false,
                    isCol    : (symbol.match(scol)) ? true : false,
                    isTerm   : (symbol.match(sterm)) ? true : false,
                    asString : symbol.substring(0, symbol.length-1)
                };
                
                this.elements.push(elem);
                this.sequence += symbol;
            }
            this.sequence = this.sequence.trim();
        }
    };
    
    seq.prototype.getPermutations = function() {
        var permArray = [];
        
        for (var i = 0; i < this.elements.length - 1; i += 1) {
            for (var j = i + 1; j < this.elements.length; j += 1) {
                var iEl = this.elements[i],
                    jEl = this.elements[j];
                    
                // two lox symbols found
                if (iEl.isLox & iEl.symbol == jEl.symbol) {
                    
                    // different direction
                    if (iEl.sign != jEl.sign) {
                        // turn and add to perm array
                        permArray.push(Sequence(this.reverseString(i, j)));
                        
                    } 
                    // same direction
                    else
                    {
                        // cut and add to perm array
                        permArray.push(Sequence(this.cutString(i, j)));
                    }
                }
            }
        }
        
        return permArray;
    };
    
    /**
     * reverse +A +1 -2 -A into -A +2 -1 +A
     */
    seq.prototype.reverseString = function(from, to) {
        var seqString = "", i = 0, e;
        
        for (i = 0; i < from; i += 1) {
            e = this.elements[i];
            seqString += e.asString + " ";
        }
        
        // reverse the subsequence
        for (i = to; i >= from; i -= 1) {
            e = this.elements[i];
            seqString += ((e.sign === '+') ? '-' : '+') + e.symbol + " ";
        }
        
        for(i = to + 1; i < this.elements.length; i += 1) {
            e = this.elements[i];
            seqString += e.asString + " ";
        }
        
        return seqString.trim();
    };
    
    /**
     * cuts +A +1 -2 +A into +A
     */
    seq.prototype.cutString = function(from, to) {
        var seqString = "", i = 0, e;
        
        for (i = 0; i <= from; i += 1) {
            e = this.elements[i];
            seqString += e.asString + " ";
        }
        
        for(i = to + 1; i < this.elements.length; i += 1) {
            e = this.elements[i];
            seqString += e.asString + " ";
        }
        
        return seqString.trim();
        
    };
    
    seq.prototype.evaluate = function() {
        var i = 0, retString = "";
        
        while(i < this.elements.length && this.elements[i].asString != '+!') {
            var elem = this.elements[i];
            if (elem.isCol & elem.sign == '+') {
                retString += elem.asString + " ";
            }
            i += 1;
        }
        
        return Sequence(retString.trim());
    };
    
    seq.prototype.normalize = function() {
        var lox = [], countLox = 0, cols = [], countCols = 1,
            i = 0, retString = "",
            loxCharStart = "A".charCodeAt(0);
        
        for (i = 0; i < this.elements.length; i += 1) {
            var elem = this.elements[i];
            
            if (elem.isLox) {
                if (!lox[elem.symbol]) {
                    lox[elem.symbol] = 
                        String.fromCharCode(loxCharStart + countLox++);
                }
                retString += elem.sign + lox[elem.symbol] + " ";
            }
            
            if (elem.isCol) {
                if (!cols[elem.symbol]) {
                    cols[elem.symbol] = countCols++;
                } 
                retString += elem.sign + cols[elem.symbol] + " ";                
            }
                
            if (elem.isTerm) {
                retString += elem.asString + " ";
            }
            
        }
        
        return Sequence(retString.trim());
        
    };
    
    Sequence = seq;

})();