angular.module('angular-d3', [])
    .factory('angularD3Svc', [function () {
        var id = 0;
        return {
            getId: function () {
                return "uid" + id++;
            }
        };
    }])
    .directive("barChart", function () {
        return {
            restrict: 'E',
            replace: false,
            scope: {
                ngData: '='
                //width: '@',
                //height: '@',
                //marginTop: '@',
                //marginLeft: '@',
                //marginRight: '@',
                //marginBottom: '@'
            },
            link: function ($scope, $element) {

                var chart = d3.select($element[0]);

                $scope.$watch("ngData", function (value) {
                    if (!value)
                        return;

                    var rect = d3.select($element[0].parentNode).node().getBoundingClientRect(),
                        margin = { top: 20, right: 20, bottom: 30, left: 50 },
                        width = rect.width - margin.left - margin.right,
                        height = rect.height - margin.top - margin.bottom;


                    //var margin = { top: $scope.marginTop || 20, right: $scope.marginRight || 20, bottom: $scope.marginBottom || 30, left: $scope.marginLeft || 40 },
                    //    width = ($scope.width || 960) - margin.left - margin.right,
                    //    height = ($scope.height || 500) - margin.top - margin.bottom;

                    var x = d3.scale.ordinal()
                                .rangeRoundBands([0, width], .1);

                    var y = d3.scale.linear()
                                .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .ticks(10);

                    chart.selectAll("*").remove();

                    var svg = chart
                        .append("svg")
                            .attr("class", "barChart")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                          .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    x.domain(value.data.map(function (d) { return d.x; }));
                    y.domain([0, d3.max(value.data, function (d) { return d.y; })]);

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                      .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text(value.axis.y);

                    svg.selectAll(".bar")
                        .data(value.data)
                      .enter().append("rect")
                        .attr("class", "bar")
                        .attr("x", function (d) { return x(d.x); })
                        .attr("width", x.rangeBand())
                        .attr("y", function (d) { return y(d.y); })
                        .attr("height", function (d) { return height - y(d.y); });
                });

            }

        };
    })
    .directive("calendarHeatmap", function () {
        return {
            restrict: 'E',
            replace: false,
            scope: {
                ngData: "=",
                width: "@",
                height: "@",
                cellSize: "="
            },
            link: function ($scope, $element) {
                var calendar = d3.select($element[0]);

                $scope.$watch("ngData", function (value) {
                    if (!value)
                        return;

                    var width = $scope.width || 960,
                        height = $scope.height || 136,
                        cellSize = $scope.cellSize || 17;

                    // var percent = d3.format(".1%"),
                    var format = d3.time.format("%Y-%m-%d");

                    // var color = function(d){
                    //     return "q" + d + "-11";
                    // };
                    // var color = d3.scale.quantize()
                    //     .domain([0, .05])
                    //     .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

                    calendar.selectAll("*").remove();

                    var svg = calendar
                        .append("div")
                        .attr("class", "calendarHeatmap")
                        .selectAll("svg")
                        .data(d3.range(value.from, value.to + 1))
                            .enter()
                            .append("svg")
                                .attr("width", width)
                                .attr("height", height)
                                .attr("class", "RdYlGn")
                            .append("g")
                                .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

                    svg.append("text")
                        .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
                        .style("text-anchor", "middle")
                        .text(function (d) { return d; });

                    var rect = svg.selectAll(".day")
                        .data(function (d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
                        .enter().append("rect")
                            .attr("class", "day")
                            .attr("width", cellSize)
                            .attr("height", cellSize)
                            .attr("x", function (d) { return d3.time.weekOfYear(d) * cellSize; })
                            .attr("y", function (d) { return d.getDay() * cellSize; })
                            .datum(format);

                    rect.append("title")
                        .text(function (d) { return d; });

                    svg.selectAll(".month")
                        .data(function (d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
                    .enter().append("path")
                        .attr("class", "month")
                        .attr("d", monthPath);

                    var data = value.data;
                    var max = 0;
                    for (var d in data) {
                        var v = data[d];
                        if (max < v)
                            max = v;
                    }

                    var color = d3.scale.quantize()
                        .domain([0, max])
                        .range(d3.range(11).map(function (d) { return "q" + d + "-11"; }));

                    rect.filter(function (d) { return d in data; })
                        .attr("class", function (d) {
                            return "day " + color(data[d]);
                        })
                        .select("title")
                        .text(function (d) { return d + ": " + data[d]; });


                    function monthPath(t0) {
                        var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                            d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
                            d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
                        return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
                            + "H" + w0 * cellSize + "V" + 7 * cellSize
                            + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
                            + "H" + (w1 + 1) * cellSize + "V" + 0
                            + "H" + (w0 + 1) * cellSize + "Z";
                    }

                });
            }
        };
    })
    .directive("circularSegment", ["angularD3Svc", function (angularD3Svc) {
        return {
            restrict: 'E',
            replace: false,
            scope: {
                ngData: '='
                //radius: "@",
                //width: "@",
                //height: "@"
            },
            link: function ($scope, $element) {
                var circular = d3.select($element[0]);
                var id = angularD3Svc.getId();

                $scope.$watch("ngData", function (value) {
                    if (!value)
                        return;

                    circular.selectAll("*").remove();

                    var rect = d3.select($element[0].parentNode).node().getBoundingClientRect(),
                        margin = { top: 20, right: 20, bottom: 20, left: 20 },
                        width = rect.width - margin.left - margin.right,
                        height = rect.height - margin.top - margin.bottom,
                        radius = Math.min(width, height) / 2,
                        d = width,
                        h = value * d,
                        y = radius - h;

                    //var width = $scope.width || 960,
                    //    height = $scope.height || 500,
                    //    radius = $scope.radius || 100,
                    //    d = radius * 2,
                    //    h = value * d,
                    //    y = radius - h;

                    var svg = circular
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height);

                    svg.append("defs")
                        .append("clipPath")
                        .attr("id", id)
                        .append("rect")
                        .attr("x", -radius)
                        .attr("y", y)
                        .attr("width", d)
                        .attr("height", h)
                    ;

                    var g = svg
                        .append("g")
                        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    g.append("circle")
                        .attr("class", "filler")
                        .attr("r", radius)
                        .attr("clip-path", "url(\"#" + id + "\")")
                    ;

                    g.append("circle")
                        .attr("r", radius)
                        .attr("class", "outline");
                });
            }
        }
    }])
    .directive("lineChart", function () {

        return {
            restrict: 'E',
            replace: false,
            scope: {
                ngData: '='
            },
            link: function ($scope, $element) {
                var lineChart = d3.select($element[0]);

                var rect = d3.select($element[0].parentNode).node().getBoundingClientRect(),
                    margin = { top: 20, right: 20, bottom: 30, left: 50 },
                    width = rect.width - margin.left - margin.right,
                    height = rect.height - margin.top - margin.bottom;

                $scope.$watch("ngData", function (value) {
                    if (!value)
                        return;

                    var x = d3.time.scale()
                        .range([0, width]);

                    var y = d3.scale.linear()
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom")
                        .tickFormat(function (x, p) {
                            return value.data[d3.format("s")(x, p)].x;
                        })
                    ;

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    var line = d3.svg.line()
                        .x(function (d, i) { return x(i); })
                        .y(function (d) { return y(d.y); });

                    lineChart.selectAll("*").remove();

                    var svg = lineChart
                        .append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    //x.domain(d3.extent(value.data, function (d, i) { return i; }));
                    x.domain([0, value.data.length - 1]);
                    y.domain(d3.extent(value.data, function (d) { return d.y; }));

                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                      .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text(value.axis.y);

                    svg.append("path")
                        .datum(value.data)
                        .attr("class", "line")
                        .attr("d", line);

                });
            }
        };

    })
    .directive("pieChart", function () {

        return {
            restrict: 'E',
            replace: false,
            scope: {
                ngData: '='
            },
            link: function ($scope, $element) {
                var pieChart = d3.select($element[0]);

                var rect = d3.select($element[0].parentNode).node().getBoundingClientRect(),
                    margin = { top: 20, right: 20, bottom: 20, left: 20 },
                    width = rect.width - margin.left - margin.right,
                    height = rect.height - margin.top - margin.bottom,
                    radius = Math.min(width, height) / 2;

                $scope.$watch("ngData", function (value) {
                    if (!value)
                        return;

                    var color = d3.scale.ordinal()
                        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

                    var arc = d3.svg.arc()
                        .outerRadius(radius - 10)
                        .innerRadius(radius - 70);

                    var pie = d3.layout.pie()
                        .sort(null)
                        .value(function (d) { return d.y; });

                    pieChart.selectAll("*").remove();

                    var svg = pieChart
                            .append("svg")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    var g = svg.selectAll(".arc")
                            .data(pie(value.data))
                              .enter().append("g")
                                .attr("class", "arc");

                    g.append("path")
                        .attr("d", arc)
                        .style("fill", function (d) { return color(d.data.x); });

                    g.append("text")
                        .attr("transform", function (d) { return "translate(" + arc.centroid(d) + ")"; })
                        .attr("dy", ".35em")
                        .text(function (d) { return d.data.x; });

                });
            }
        };

    })
    .directive("horizontalTreeChart", function () {

        return {
            restrict: 'E',
            replace: false,
            scope: {
                ngData: '=',
                ngCollapse: '@',
                ngSpacer: '@'
            },
            link: function ($scope, $element) {
                var treeChart = d3.select($element[0]);

                var rect = d3.select($element[0].parentNode).node().getBoundingClientRect(),
                    margin = { top: 20, right: 20, bottom: 20, left: 20 },
                    width = rect.width - margin.left - margin.right,
                    height = rect.height - margin.top - margin.bottom,
                    spacer = parseInt($scope.ngSpacer || "180");

                $scope.$watch("ngData", function (value) {
                    if (!value)
                        return;

                    var i = 0,
                        duration = 750,
                        root;

                    var tree = d3.layout.tree()
                        .size([height, width]);

                    var diagonal = d3.svg.diagonal()
                        .projection(function(d) { return [d.y, d.x]; });
                        
                    treeChart.selectAll("*").remove();

                    var svg = treeChart
                        .append("svg")
                            .attr("width", width + margin.right + margin.left)
                            .attr("height", height + margin.top + margin.bottom)
                            .append("g")
                                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    root = $scope.ngData;
                    root.x0 = height / 2;
                    root.y0 = 0;
                                      
                    if ($scope.ngCollapse||false)
                        root.children.forEach(collapse);
                    
                    update(root);

                    //d3.select(self.frameElement).style("height", "500px");
                    function collapse(d){
                        if (d.children){
                            d._children = d.children;
                            d._children.forEach(collapse);
                            d.children = null;
                        }
                    }

                    function update(source) {

                        // Compute the new tree layout.
                        var nodes = tree.nodes(root).reverse(),
                            links = tree.links(nodes);

                        // Normalize for fixed-depth.
                        nodes.forEach(function(d) { d.y = d.depth * spacer; });

                        // Update the nodes…
                        var node = svg.selectAll("g.node")
                            .data(nodes, function(d) { return d.id || (d.id = ++i); });

                        // Enter any new nodes at the parent's previous position.
                        var nodeEnter = node.enter().append("g")
                            .attr("class", "node")
                            .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                            .on("click", function(d) {
                                if (d.children) {
                                    d._children = d.children;
                                    d.children = null;
                                } else {
                                    d.children = d._children;
                                    d._children = null;
                                }
                                update(d);
                            });

                        nodeEnter.append("circle")
                            .attr("r", 1e-6)
                            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

                        nodeEnter.append("text")
                            .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
                            .attr("dy", ".35em")
                            .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                            .text(function(d) { return d.name; })
                            .style("fill-opacity", 1e-6);

                        // Transition nodes to their new position.
                        var nodeUpdate = node.transition()
                            .duration(duration)
                            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

                        nodeUpdate.select("circle")
                            .attr("r", 10)
                            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

                        nodeUpdate.select("text")
                            .style("fill-opacity", 1);

                        // Transition exiting nodes to the parent's new position.
                        var nodeExit = node.exit().transition()
                            .duration(duration)
                            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                            .remove();

                        nodeExit.select("circle")
                            .attr("r", 1e-6);

                        nodeExit.select("text")
                            .style("fill-opacity", 1e-6);

                        // Update the links…
                        var link = svg.selectAll("path.link")
                            .data(links, function(d) { return d.target.id; });

                        // Enter any new links at the parent's previous position.
                        link.enter().insert("path", "g")
                            .attr("class", "link")
                            .attr("d", function(d) {
                                var o = {x: source.x0, y: source.y0};
                                return diagonal({source: o, target: o});
                            });

                        // Transition links to their new position.
                        link.transition()
                            .duration(duration)
                            .attr("d", diagonal);

                        // Transition exiting nodes to the parent's new position.
                        link.exit().transition()
                            .duration(duration)
                            .attr("d", function(d) {
                                var o = {x: source.x, y: source.y};
                                return diagonal({source: o, target: o});
                            })
                            .remove();

                        // Stash the old positions for transition.
                        nodes.forEach(function(d) {
                            d.x0 = d.x;
                            d.y0 = d.y;
                        });
                    }

                });
            }
        };

    })
    .directive("treeChart", function () {

        return {
            restrict: 'E',
            replace: false,
            scope: {
                ngData: '=',
                ngCollapse: '@',
                ngNodeWidth: '@',
                ngNodeHeight: '@',
                ngDuration: '@',
                ngSpacer: '@'
            },
            link: function ($scope, $element) {
                var treeChart = d3.select($element[0]);

                var rect = d3.select($element[0].parentNode).node().getBoundingClientRect(),
                    margin = { top: 20, right: 20, bottom: 20, left: 20 },
                    width = rect.width - margin.left - margin.right,
                    height = rect.height - margin.top - margin.bottom,
                    center = width/2,
                    duration = $scope.ngDuration || 750,
                    rectW = parseInt($scope.ngNodeWidth || "60"),
                    rectH = parseInt($scope.ngNodeHeight || "30"),
                    spacer = parseInt($scope.ngSpacer || (rectH + 10));

                $scope.$watch("ngData", function (value) {
                    if (!value)
                        return;

                    var i = 0;

                    var tree = d3.layout.tree().nodeSize([rectW + 10, rectH]);
                    var diagonal = d3.svg.diagonal()
                        .projection(function (d) {
                        return [d.x + rectW / 2, d.y + rectH / 2];
                    });

                    var svg = treeChart
                                .append("svg")
                                    .attr("width", width)
                                    .attr("height", height)
                                    .call(zm = d3.behavior.zoom().scaleExtent([1,3]).on("zoom", redraw))
                                    .append("g")
                                        .attr("transform", "translate(" + center + "," + margin.top + ")");

                    //necessary so that zoom knows where to zoom and unzoom from
                    zm.translate([center, margin.top]);

                    var root = $scope.ngData;
                    root.x0 = 0;
                    root.y0 = height / 2;

                    function collapse(d) {
                        if (d.children) {
                            d._children = d.children;
                            d._children.forEach(collapse);
                            d.children = null;
                        }
                    }

                    if ($scope.ngCollapse||false)
                        root.children.forEach(collapse);
                        
                    update(root);

                    function update(source) {

                        // Compute the new tree layout.
                        var nodes = tree.nodes(root).reverse(),
                            links = tree.links(nodes);

                        // Normalize for fixed-depth.
                        nodes.forEach(function (d) {
                            d.y = d.depth * spacer;
                        });

                        // Update the nodes…
                        var node = svg.selectAll("g.node")
                            .data(nodes, function (d) {
                            return d.id || (d.id = ++i);
                        });

                        // Enter any new nodes at the parent's previous position.
                        var nodeEnter = node.enter().append("g")
                            .attr("class", "node")
                            .attr("transform", function (d) {
                            return "translate(" + source.x0 + "," + source.y0 + ")";
                        })
                            .on("click", click);

                        nodeEnter.append("rect")
                            .attr("width", rectW)
                            .attr("height", rectH)
                            .attr("stroke", "black")
                            .attr("stroke-width", 1)
                            .attr("class", function(d){
                                return d._children?"expandable":"";
                            })
                            .style("fill", function (d) {
                                return d._children ? "lightsteelblue" : "#fff";
                            });
                        
                        nodeEnter.append("title")
                            .text(function(d){
                                return d.title==null?"":d.title;
                            });

                        nodeEnter.append("text")
                            .attr("x", rectW / 2)
                            .attr("y", rectH / 2)
                            .attr("dy", ".35em")
                            .attr("text-anchor", "middle")
                            .text(function (d) {
                            return d.name;
                        });

                        // Transition nodes to their new position.
                        var nodeUpdate = node.transition()
                            .duration(duration)
                            .attr("transform", function (d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });

                        nodeUpdate.select("rect")
                            .attr("width", rectW)
                            .attr("height", rectH)
                            .attr("stroke", "black")
                            .attr("stroke-width", 1)
                            .style("fill", function (d) {
                            return d._children ? "lightsteelblue" : "#fff";
                        });

                        nodeUpdate.select("text")
                            .style("fill-opacity", 1);

                        // Transition exiting nodes to the parent's new position.
                        var nodeExit = node.exit().transition()
                            .duration(duration)
                            .attr("transform", function (d) {
                            return "translate(" + source.x + "," + source.y + ")";
                        })
                            .remove();

                        nodeExit.select("rect")
                            .attr("width", rectW)
                            .attr("height", rectH)
                        //.attr("width", bbox.getBBox().width)""
                        //.attr("height", bbox.getBBox().height)
                        .attr("stroke", "black")
                            .attr("stroke-width", 1);

                        nodeExit.select("text");

                        // Update the links…
                        var link = svg.selectAll("path.link")
                            .data(links, function (d) {
                            return d.target.id;
                        });

                        // Enter any new links at the parent's previous position.
                        link.enter().insert("path", "g")
                            .attr("class", "link")
                            .attr("x", rectW / 2)
                            .attr("y", rectH / 2)
                            .attr("d", function (d) {
                            var o = {
                                x: source.x0,
                                y: source.y0
                            };
                            return diagonal({
                                source: o,
                                target: o
                            });
                        });

                        // Transition links to their new position.
                        link.transition()
                            .duration(duration)
                            .attr("d", diagonal);

                        // Transition exiting nodes to the parent's new position.
                        link.exit().transition()
                            .duration(duration)
                            .attr("d", function (d) {
                            var o = {
                                x: source.x,
                                y: source.y
                            };
                            return diagonal({
                                source: o,
                                target: o
                            });
                        })
                            .remove();

                        // Stash the old positions for transition.
                        nodes.forEach(function (d) {
                            d.x0 = d.x;
                            d.y0 = d.y;
                        });
                    }

                    // Toggle children on click.
                    function click(d) {
                        if (d.children) {
                            d._children = d.children;
                            d.children = null;
                        } else {
                            d.children = d._children;
                            d._children = null;
                        }
                        update(d);
                    }

                    //Redraw for zoom
                    function redraw() {
                    //console.log("here", d3.event.translate, d3.event.scale);
                    svg.attr("transform",
                        "translate(" + d3.event.translate + ")"
                        + " scale(" + d3.event.scale + ")");
                    }

                });
            }
        };

    });