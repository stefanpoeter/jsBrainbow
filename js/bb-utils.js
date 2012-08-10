(function() {
    
    var utils = function(seq) {

        if (!(this instanceof utils)) {
            return new utils(seq);
        }
        
        var that = this;
        
        if (typeof(seq) === 'string') {
            this.seq = Sequence(seq);
        } else {
            this.seq = seq;
        }
        
        return {
            count : function() {
                return that.count();
            },
            getLoxSites : function() {
                return that.getLoxSites();
            },
            getAllPermutations : function() {
                return that.getAllPermutations();
            },
            getTransMatrix : function() {
                return that.getTransMatrix();
            },
            calcProbs : function() {
                return that.calcProbs();
            }
        };
        
    };
    
    utils.prototype.count = function() {
        var elems = this.seq.toArray(),
            res = { lox: 0, col: 0, term: 0};
        
        for (var i = 0; i < elems.length; i += 1) {
            if (elems[i].isLox) res.lox += 1;
            if (elems[i].isCol) res.col += 1;
            if (elems[i].isTerm) res.term +=1;
        }
        
        return res;
    };
    
    utils.prototype.getLoxSites = function() {
        var elems = this.seq.toArray(),
            sites = { invert: [], cut: [] };
            
        for (var i = 0; i < elems.length - 1; i += 1) {
            for  (var j = i + 1; j < elems.length; j += 1) {
                
                if (elems[i].isLox & elems[j].symbol === elems[i].symbol) {
                    if (elems[i].sign !== elems[j].sign) {
                        sites.invert.push( { from: i, to: j } ); 
                    } else {
                        sites.cut.push( { from : i, to: j } );
                    }
                }
                
            }
        }
        
        return sites;
    };
    
    utils.prototype.getAllPermutations = function() {
        var queue = [],
            handledSeq = [],
            currentSeq;
            
        queue.push(this.seq);
            
        while (queue.length > 0) {
            
            currentSeq = queue.shift();
            if (!handledSeq.hasOwnProperty(currentSeq.toString())) {
                handledSeq[currentSeq.toString()] = currentSeq;
                var perm = currentSeq.getPermutations();
                
                for (var i = 0;  i < perm.length; i += 1) {
                    queue.push(perm[i]);
                }

            }
            
        }
        
        var res = [];
        
        for (var s in handledSeq) {
            res.push(handledSeq[s]);
        }
        
        return res;
    };
    
    utils.prototype.getTransMatrix = function() {
        var matrix = [],
            map = {},
            perms = this.getAllPermutations();
            
        // index the permuation strings
        var i = 0;
        for (var st in perms) {
            map[perms[st].toString()] = i++;
        }
        
        // alias for getting permutation indices
        var vOf = function(index, ary) {
            if (!ary) 
                ary = perms;
            return map[ary[index].toString()];
        };
          
        // iterating of the permutations
        for(var s in perms) {
            var sPerms = perms[s].getPermutations(),
                n = sPerms.length;

            var index = vOf(s);
            matrix[index] = [];
            for (var ms in perms) { matrix[index][vOf(ms)] = 0; }
            for (var ns in sPerms) { matrix[index][vOf(ns, sPerms)] = 1 / n; }
            
            // check row for sum = 1
            var sum = 0;
            for (var k = 0; k < matrix[index].length; k += 1) {
                sum += matrix[index][k];
            }
            // if sum === 0 then set a 1 in the diagonal
            if (sum === 0) {
                matrix[index][index] = 1;
            }
        }
        
        return matrix;
    };
    
    utils.prototype.calcLimesMatrix = function(transMatrix) {
        var matrix = $M(transMatrix),
            matOdd = matrix,
            matEven = matrix.x(matrix),
            matSum, startVector,
            epsilon = 0.00001,
            lastSum;
            
            
        // console.group('diffs');

        lastSum = Matrix.Zero(matrix.rows(), matrix.cols());
        for (var k = 0; k < 100; k += 1) {
            var biggestDiff = 0;

            matOdd = matOdd.x(matrix);
            matEven = matOdd.x(matrix);
               
            matSum = matOdd.add(matEven).x( 1/ 2 );
                   
            for (var i = 0; i < matSum.rows(); i += 1) {
                for (var j = 0; j < matSum.cols(); j += 1) {
                    var diff = Math.abs(matSum.elements[i][j] - lastSum.elements[i][j]);
                    if (biggestDiff < diff) {
                        biggestDiff = diff;
                    }
                }
            }
            
            //console.log("Biggest difference: " + biggestDiff);

            
            
            if (biggestDiff < epsilon) {
                //console.log("Finished after " + k + " iterations.");
                break;
            }
            
            lastSum = matSum.dup();
        }
        
        //console.groupEnd();
        
        

            
        // multiplicate with start vector (1, 0, ...)
        
        startVector = Matrix.Zero(1, matrix.rows());
        startVector.elements[0][0] = 1;
        
        return startVector.x(matSum);
    };
    
    utils.prototype.calcProbs = function() {
        var matrix = this.getTransMatrix(),
            stopVector = this.calcLimesMatrix(matrix),
            perms = this.getAllPermutations(),
            map = {};
           
        var i = 0;
        for (var st in perms) {
            map[perms[st].toString()] = i++;
        }
        
        // alias for getting permutation indices
        var vOf = function(index, ary) {
            if (!ary) 
                ary = perms;
            return map[ary[index].toString()];
        };
        
        var res = [], seqMap = {};
        
        for (var j = 0; j < stopVector.cols(); j += 1) {
            var str = perms[j].evaluate().toString(),
                value = stopVector.e(1, j+1);
                
            if (str === '') {
                str = "nothing";
            }
                
            if (seqMap[str] === undefined) {
                seqMap[str] = 0;
            }
            seqMap[str] += value;
        }
        
        for (var seqs in seqMap) {
            res.push( { seqString: seqs, prob: Number(seqMap[seqs]).toFixed(2) });   
        }
        
        return res;
        
    
    };
    
    SeqUtils = utils;
    
    
})();