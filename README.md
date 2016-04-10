# angular-D3
Angular D3

<a href="http://embed.plnkr.co/Ax3vL7L24VlQKCQiAeOv/">Demo</a>

# Install
```code
bower install angular-d3-components
```

# CSS
```html
<link rel="stylesheet" href="angular-d3.css" />
```

# Script
```html
<script type="javascript" src="angular-d3.js"></script>
```

# Angular module
```javascript
angular.module("yourApp", ["angular-d3"])
```

# HTML Tag
```html
<div style="wdith: 100%; height: 300px">
    <tree-chart ng-data="treeChartData1" ng-collapse="true" ng-node-width="150" ng-spacer="50"></tree-chart>
</div>

<div style="wdith: 100%; height: 300px">
    <horizontal-tree-chart ng-data="treeChartData2" ng-collapse="true"></horizontal-tree-chart>
</div>

<div style="width: 100%; height: 300px">
    <line-chart ng-data="barChartData"></line-chart>
</div>
<div style="width: 100%; height: 300px">
    <bar-chart ng-data="barChartData" width="960" height="500"></bar-chart>
</div>
<div style="width: 100%; height: 300px">
    <circular-segment ng-data="circleK" radius="150" width="960" height="500"></circular-segment>
</div>
<calendar-heatmap ng-data="calendarData" width="960" height="136" cell-size="17" class="cal"></calendar-heatmap>
```

# Data Structure
```javascript
//----------------------------------- Bar Chart & Line Chart
$scope.barChartData = {
    axis: {
        x: 'Letter',
        y: 'Frequency'
    },
    data: [{ x: 'A', y: 10 }, { x: 'B', y: 20 }, { x: 'C', y: 30 }]
};

//----------------------------------- Calendar Heatmap
$scope.calendarData = {
    from: 2016,
    to: new Date().getFullYear(),
    data: {
        '2016-01-02': 3,
        '2016-01-03': 5,
        '2016-03-25': 0,
        '2016-06-13': 0
    }
};

//----------------------------------- Circular Segment
$scope.circleK = 0.1;

//----------------------------------- Tree Chart
$scope.treeChartData1 =
    {
        "name": "Top Level",
        "children": [
            {
                "name": "Level 2: A",
                "children": [
                {
                    "name": "Son of A",
                },
                {
                    "name": "Daughter of A",
                    "children": [{
                        "name": "Grand Daughter"
                    }]
                }
                ]
            },
            {
                "name": "Level 2: B",
            }
        ]
    };
    
$scope.treeChartData2 = angular.copy($scope.treeChartData1);
```