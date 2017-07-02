/**
 * @author Darina
 */ 
var POINT_WIDTH = 4;
var POINT_HIT_TOLERANCE = 5;
var CANVAS = null;
var CONTEXT = null;
var DRAW_BUTTON = null;
var DEGREE_INPUT = null;
var CURRENT_DRAGGED_POINT = -1;
var CURRENT_POINTS = Array();
 
 function onStart()
 {
 	CANVAS = document.getElementById("canvas");
 	CANVAS.width = document.body.clientWidth;
 	CANVAS.height = 480;
 	
	CONTEXT = CANVAS.getContext("2d");
	DRAW_BUTTON = document.getElementById("drawCurveButton");
	DEGREE_INPUT = document.getElementById("degreeInput");
	
	addEventListener("mousedown", function onClick(e)
 	{
    	var rect = CANVAS.getBoundingClientRect();
    	var posx = e.clientX - rect.left;
    	var posy = e.clientY - rect.top;
		
		if(posx > rect.width || posy > rect.height)
		{
			return;
		}
		
		determineSelectedPointIndex(posx, posy);
		
		if(CURRENT_DRAGGED_POINT >= 0)
		{
			return;
		}
		
    	CONTEXT.fillStyle = "#0000CD";
    	CONTEXT.beginPath();
    	CONTEXT.arc(posx, posy, POINT_WIDTH, 0, 2 * Math.PI);
    	CONTEXT.fill();
    	
    	if(CURRENT_POINTS.length > 0)
    	{
    		var prevPoint = CURRENT_POINTS[CURRENT_POINTS.length - 1];
    		CONTEXT.strokeStyle = "#0000CD";
    		CONTEXT.beginPath();
    		CONTEXT.moveTo(prevPoint.x, prevPoint.y);
    		CONTEXT.lineTo(posx, posy);
    		CONTEXT.stroke();
    	}
    	
    	CURRENT_POINTS.push({x: posx, y: posy});
    	
    	DEGREE_INPUT.value = CURRENT_POINTS.length - 1;
	});
	
	CANVAS.addEventListener("mousemove", function onMove(e)
	{
		if(CURRENT_DRAGGED_POINT < 0)
		{
			return;
		}
		
		var rect = CANVAS.getBoundingClientRect();
    	var posx = e.clientX - rect.left;
    	var posy = e.clientY - rect.top;
    	
    	CURRENT_POINTS[CURRENT_DRAGGED_POINT] = {x: posx, y: posy};
    	
    	handleSceneChanged();
	});
	
	addEventListener("mouseup", function onMouseUp(e)
	{
		CURRENT_DRAGGED_POINT = -1;
	});
	
	addEventListener("keydown", function onKeyDown(e)
	{
		if ( e.keyCode == 68 ) //the D key
		{
			if(CURRENT_POINTS.length > 0)
			{
				CURRENT_POINTS.pop();
				if(CURRENT_POINTS.length > 0)
				{
					DEGREE_INPUT.value = CURRENT_POINTS.length - 1;
				}
				
				handleSceneChanged();
			}
		}
	});
};

function drawCurve()
{
	if(CURRENT_POINTS.length < 2)
	{
		return;
	}
	
	CONTEXT.fillStyle = "#FF0000";
	
	var currentIterationPoints = CURRENT_POINTS.slice();
	var nextIterationPoints = Array();
	
	for(var t = 0.0; t < 1.0; t += 0.0001)
	{
		while(nextIterationPoints.length != 1)
		{
			nextIterationPoints = Array();
			for(var i = 0; i < currentIterationPoints.length - 1; ++i)
			{
				var x = (currentIterationPoints[i].x * (1 - t)) + (currentIterationPoints[i + 1].x * t); 
				var y = (currentIterationPoints[i].y * (1 - t)) + (currentIterationPoints[i + 1].y * t);
				
				nextIterationPoints.push({x: x, y: y});
			}
			currentIterationPoints = nextIterationPoints.slice();
		}
		
		CONTEXT.fillRect(nextIterationPoints[0].x, nextIterationPoints[0].y, 1, 1);
		
		currentIterationPoints = CURRENT_POINTS.slice();
		nextIterationPoints = Array();
	}
   
   CONTEXT.stroke();
   
   CURVE_WAS_DRAWN = true;
};

function elevateDegree()
{
	var currentDegree = CURRENT_POINTS.length - 1;
	var wantedDegree = DEGREE_INPUT.value;
	
	if(currentDegree > wantedDegree)
	{
		alert("Could not elevate to a lower degree!");
		DEGREE_INPUT.value = currentDegree + 1;
		return;
	}
	else if (currentDegree == wantedDegree)
	{
		DEGREE_INPUT.value = currentDegree + 1;
		elevateDegreeByOne();
	}
	else
	{
		for(var i = currentDegree; i < wantedDegree; ++i)
		{
			elevateDegreeByOne();
		}
	}
	
	handleSceneChanged();
}

function elevateDegreeByOne()
{
	var newControlPoints = Array();
	var currentDegree = CURRENT_POINTS.length - 1;
	
	for(var i = 0; i <= (currentDegree + 1); ++i)
	{
		if(i == 0)
		{
			newControlPoints.push(CURRENT_POINTS[0]);
			continue;
		}
		else if(i == (currentDegree + 1))
		{
			newControlPoints.push(CURRENT_POINTS[currentDegree]);
			continue;
		}
		
		var coef = i / (currentDegree + 1);
		var x = (coef * CURRENT_POINTS[i - 1].x) + ((1 - coef) * CURRENT_POINTS[i].x);
		var y = (coef * CURRENT_POINTS[i - 1].y) + ((1 - coef) * CURRENT_POINTS[i].y);
		
		newControlPoints.push({x: x, y: y});
	}
	
	CURRENT_POINTS = newControlPoints.slice();
}

function handleSceneChanged()
{
	CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
	
	for(var i = 0; i < CURRENT_POINTS.length; ++i)
	{
		CONTEXT.fillStyle = "#0000CD";
    	CONTEXT.beginPath();
    	CONTEXT.arc(CURRENT_POINTS[i].x, CURRENT_POINTS[i].y, POINT_WIDTH, 0, 2 * Math.PI);
    	CONTEXT.fill();
    	
    	if(i > 0)
    	{
    		var prevPoint = CURRENT_POINTS[CURRENT_POINTS.length - 1];
    		CONTEXT.strokeStyle = "#0000CD";
    		CONTEXT.beginPath();
    		CONTEXT.moveTo(CURRENT_POINTS[i - 1].x, CURRENT_POINTS[i - 1].y);
    		CONTEXT.lineTo(CURRENT_POINTS[i].x, CURRENT_POINTS[i].y);
    		CONTEXT.stroke();
    	}
	}
	
	if(CURVE_WAS_DRAWN)
	{
		drawCurve();
	}
}

function determineSelectedPointIndex(x, y)
{
	var a;
	var b;
	
	for(var i = 0; i < CURRENT_POINTS.length; ++i)
	{
		a = (x - CURRENT_POINTS[i].x) * (x - CURRENT_POINTS[i].x);
		b = (y - CURRENT_POINTS[i].y) * (y - CURRENT_POINTS[i].y);
		
		if(a + b <= ((POINT_WIDTH * POINT_WIDTH) + POINT_HIT_TOLERANCE))
		{
			CURRENT_DRAGGED_POINT = i;
			break;
		}
	}
};

function clearCanvas()
{
	CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);
	
	CURRENT_POINTS = Array();
	
	DEGREE_INPUT.value = 0;
	
	CURVE_WAS_DRAWN = false;	
};
