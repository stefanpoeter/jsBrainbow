(function() {
    
    var background = {
            'fill-color' : 'gray',
            'border-width' : 1,
            'border-color' : 'gray',
            'left-offset' : 20,
            'right-offset' : 20,
            'top-offset' : 20,
            'bottom-offset': 100            
        },
        symbols = {
            height: 30
        },
        term = {
            'fill-color': 'black',
            width: 5,
            height: symbols.height,
            'border-width' : 1,
            'border-color': 'black'
        },
        lox = {
            'fill-color' : 'gray',
            width: 15,
            height: symbols.height,
            'border-width' : 1,
            'border-color' : 'black'
        },
        col = {
            'fill-colors' : ['red', 'green', 'blue', 'yellow', 'pink', 'cyan', 'orange', 'magenta', 'gray'],
            width: 30,
            height: symbols.height,
            'border-width': 1,
            'border-color': 'black'
        },
        trace = {
            height: 15, 
            'fill-color': "white",
            'border-color': "black",
            'border-size': 1,
            'start-offset': 15,
            'end-offset': 15,
            'symbol-space': 5
        };
    
    
    var bbraph = function(paper, x, y) {
        
        if (!(this instanceof bbraph))
            return new bbraph(paper, x, y);
        
        var that = this;
        this.paper = paper;
        this.start = { x: x, y: y };
        
        this.draw = {};
        this.all = this.paper.set();
        
        return {
            setSequence : function(seq) {
                if (!seq instanceof Sequence) {
                    return;
                }
                
                that.sequence = seq;
                
            },
            draw : function() {
                that.drawSequence();
            },
            getWidth : function() {
                if (that.draw) {
                    return that.draw.background.getBBox().width;
                } else {
                    return 0;
                }
            },
            getHeight : function() {
                if (that.draw) {
                    return that.draw.background.height;
                } else {
                    return 0;
                }
            },
            getPosition : function() {
                return that.start;
            },
            moveTo : function(x, y) {
                var dx = that.start.x - x,
                    dy = that.start.y - y;
                    
                that.start.x -= dx;
                that.start.y -= dy;
                
                that.drawSequence();
            }
            
                
        };
        
        
    };
    
    bbraph.prototype.drawSequence = function() {
        this.paper.clear();
        var elements = this.sequence.toArray(), 
            that = this,
            currentPos;
            
        this.draw.background = this.drawBackground();
        this.draw.trace = this.drawTrace();
        this.draw.symbols = [];
        this.draw.sequence = this.paper.set();
        
        this.all.push(this.draw.background);
        this.all.push(this.draw.trace);
        
        this.draw.sequence.push(this.draw.trace);
        
                
        currentPos = this.start.x + trace['start-offset'];
        for (var i = 0; i < elements.length; i += 1) {
            var e = elements[i], icon;
            if (e.isLox) {
                icon = this.drawLox(e, currentPos);
                currentPos += lox.width;
            }
            if (e.isCol) {
                icon = this.drawCol(e, currentPos);
                icon.attr({fill: col['fill-colors'][e.symbol]});
                currentPos += col.width;
            }
            if (e.isTerm) {
                icon = this.drawTerm(e, currentPos);
                currentPos += term.width;
            }
            
            currentPos += (i < elements.length - 1) ? trace['symbol-space'] : 0;
            
            this.draw.trace.attr({'width' : (currentPos - this.start.x) + trace['start-offset']});
            
            this.draw.symbols.push(icon);
            this.draw.sequence.push(icon);
            this.all.push(icon);
        }
        
       /* this.all.mouseover( function (e) {
            that.showSequenceInfos.apply(that, [e]);
        });
        this.all.mouseout( function (e) {
            that.hideSequenceInfos.apply(that, [e]);
        });
        
        that.drawMarker(); */
        
    };
    
    bbraph.prototype.showSequenceInfos = function(e) {
        var movement = (background['bottom-offset'] - symbols.height) / 2;
        this.draw.background.attr({'fill-opacity' : 0.5});
        this.draw.sequence.animate({translation: "0 " + movement}, 200);        
    };
    
    bbraph.prototype.hideSequenceInfos = function(e) {
        var movement = (background['bottom-offset'] - symbols.height) / 2;            
        this.draw.background.attr({'fill-opacity' : 0});
        this.draw.sequence.animate({translation: "0 -" + movement}, 200);            
    };
    
    bbraph.prototype.drawBackground = function() {
        
        var width = trace['start-offset'],
            elements = this.sequence.toArray(),
            bg;
            
        for (var j = 0; j < elements.length; j += 1) {
            if (elements[j].isLox)
                width += lox.width;
            if (elements[j].isCol)
                width += col.width;
            if (elements[j].isTerm)
                width += term.width;
                
            width += (j < elements.length - 1) ? trace['symbol-space'] : 0;                
        }
        
        width += trace['end-offset'];
        
        bg = this.paper.rect(
            this.start.x - background['left-offset'], 
            this.start.y + trace.height / 2 - background['top-offset'],
            width + background['left-offset'] + background['right-offset'],
            trace.height + background['top-offset'] + background['bottom-offset']);
        bg.attr(
            {
                'fill' : 'gray',
                'stroke' : 0,
                'fill-opacity' : 0
            }
        );
        
        return bg;
        
        
    };
    
    bbraph.prototype.drawTrace = function() {
        var elements = this.sequence.toArray(),
            that = this,
            ret;
            
        ret = this.paper.rect(this.start.x, this.start.y + trace.height / 2, trace['start-offset'], trace.height);
        ret.attr(
            {
                'stroke-width' : trace['border-width'],
                'stroke' : trace['border-color'],
                'fill' : trace['fill-color'] 
            }
        );
            
        return ret;
        
    };
    
    bbraph.prototype.drawLox = function(elem, xpos) {
        var path;
        
        if (elem.sign == '+') {
            path = this.paper.path(
                "M" + xpos + " " + this.start.y + " " +
                "L" + xpos + " " + (this.start.y + lox.height) + " " +
                "L" + (xpos + lox.width) + " " + (this.start.y + lox.height / 2) + " " +
                "Z"
            );
        } else {
            path = this.paper.path(
                "M" + xpos + " " + (this.start.y + lox.height / 2) + " " + 
                "L" + (xpos + lox.width) + " " + (this.start.y) + " " + 
                "L" + (xpos + lox.width) + " " + (this.start.y + lox.height) + " " + 
                "Z"
            );
        }
        this.draw.symbols.push(path);
        path.attr({
                fill: lox['fill-color'],
                stroke: lox['border-color'],
                'stroke-width': lox['border-width']
            
            }
        );
        
        return path;
        

    };
    
    bbraph.prototype.drawCol = function(elem, xpos) {
        var path;
        
        if (elem.sign == '+') {
            path = this.paper.path(
                "M" + xpos + " " + this.start.y + " " +
                "L" + xpos + " " + (this.start.y + col.height) + " " +
                "L" + (xpos + (2 * (col.width / 3))) + " " + (this.start.y + col.height) + " " +
                "L" + (xpos + col.width) + " " + (this.start.y + col.height / 2) + " " +
                "L" + (xpos + (2 * (col.width / 3))) + " " + this.start.y + " " +
                "Z");
        } else {
            path = this.paper.path(
                "M" + xpos + " " + (this.start.y + col.height / 2) + " " +
                "L" + (xpos + (1 * (col.width / 3))) + " " + this.start.y + " " +
                "L" + (xpos + (col.width)) + " " + (this.start.y) + " " +
                "L" + (xpos + (col.width)) + " " + (this.start.y + col.height) + " " +
                "L" + (xpos + (1 * (col.width / 3))) + " " + (this.start.y + col.height) + " " +                
                "Z");            
        }
            
        this.draw.symbols.push(path);
        path.attr(
            {
                'stroke-width' : col['border-width'],
                'stroke' : col['border-color']
            }
        );
        
        return path;
    };
    
    bbraph.prototype.drawTerm = function(elem, xpos) {
        var path;
        
        if (elem.sign == "-") {
            path = this.paper.path(
                "M" + xpos + " " + this.start.y + " " +
                "L" + xpos + " " + (this.start.y + (1 * (term.height / 5))) + " " +
                "M" + xpos + " " + (this.start.y + (2 * (term.height / 5))) + " " +
                "L" + xpos + " " + (this.start.y + (term.height)) + " " +
                "L" + (xpos + term.width) + " " + (this.start.y + (term.height)) + " " +
                "L" + (xpos + term.width) + " " + (this.start.y + (2 * (term.height / 5))) + " " +
                "L" + (xpos) + " " + (this.start.y + (2 * (term.height / 5))) + " " +
                "M" + (xpos) + " " + (this.start.y + (1 * (term.height / 5))) + " " +
                "L" + (xpos + term.width) + " " + (this.start.y + (1 * (term.height / 5))) + " " +
                "L" + (xpos + term.width) + " " + (this.start.y) + " " +
                "L" + xpos + " " + this.start.y);
        } else {
            path = this.paper.path(
                "M" + xpos + " " + this.start.y + " " +
                "L" + xpos + " " + (this.start.y + (3 * (term.height / 5))) + " " +
                "M" + xpos + " " + (this.start.y + (4 * (term.height / 5))) + " " +
                "L" + xpos + " " + (this.start.y + (term.height)) + " " +
                "L" + (xpos + term.width) + " " + (this.start.y + (term.height)) + " " +
                "L" + (xpos + term.width) + " " + (this.start.y + (4 * (term.height / 5))) + " " +
                "L" + (xpos) + " " + (this.start.y + (4 * (term.height / 5))) + " " +
                "M" + (xpos) + " " + (this.start.y + (3 * (term.height / 5))) + " " +
                "L" + (xpos + term.width) + " " + (this.start.y + (3 * (term.height / 5))) + " " +
                "L" + (xpos + term.width) + " " + (this.start.y) + " " +
                "L" + xpos + " " + this.start.y);
        }
            
        this.draw.symbols.push(path);
        path.attr(
            {
                fill: term['fill-color'],
                stroke: term['border-color'],
                'stroke-width': term['border-width']
                
            }
        );
        
        return path;
    };
    
    bbraph.prototype.drawMarker = function() {
        var marker = SeqUtils(this.sequence).getLoxSites(), 
            level = 10;
        
        for (var c in marker.cut) {
            this.drawCutMarker(marker.cut[c].from, marker.cut[c].to, level);
            level += 10;
        }
        
    };
    
    bbraph.prototype.drawCutMarker = function(from, to, ypos) {
        var path, 
            startX = this.draw.symbols[from].getBBox().x,
            endX = this.draw.symbols[to].getBBox().x;
              
        path = this.paper.path(
            "M" + startX + " " + (ypos + 5) + " " +
            "L" + startX + " " + ypos + " " +
            "L" + endX + " " + ypos + " " +
            "L" + endX + " " + (ypos + 5));
              
        return path;
    };
    
    
    SequenceUI = bbraph;

})();