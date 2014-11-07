	function init(img,imgsize) {
		if (!img) {
			img = "jh.png";
		}
		if (!imgsize) {
			imgsize = 16;
		}
		var weapon ={
			obj : null,
			status : true//true表示正在使用，false表示可以删除
		};
		var $score = $("#score");
		// Define the canvas
		var canvaselem = $("#canvas");
		var canvaswidth = canvaselem.parent().width();
		var canvasheight = canvaselem.parent().height();
		var context = canvaselem[0].getContext("2d");
		canvaselem.attr("width", canvaswidth).attr("height", canvasheight);

		// Define the world
		var gravity = new b2Vec2(0,0);
		var doSleep = false;
		var world = new b2World(gravity, doSleep);
		var deletionBuffer = 4;

		//create ground
		var fixDef = new b2FixtureDef;
		fixDef.density = .5;
		fixDef.friction = 0;
		fixDef.restitution = 1;
		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_staticBody;
		fixDef.shape = new b2PolygonShape;
		fixDef.shape.SetAsBox(canvaswidth/2,2);
		bodyDef.position.Set(canvaswidth/2, 0);
		world.CreateBody(bodyDef).CreateFixture(fixDef);

		var roofData = { name : "roof"};
		bodyDef.userData = roofData;//设置顶部roof的name，用于碰撞检测
		bodyDef.position.Set(canvaswidth/2, canvasheight - 2);
		world.CreateBody(bodyDef).CreateFixture(fixDef);
		bodyDef.userData = null;//将顶部的数据清空

		fixDef.shape.SetAsBox(2,canvasheight/2);
		bodyDef.position.Set(0, canvasheight/2);
		world.CreateBody(bodyDef).CreateFixture(fixDef);
		bodyDef.position.Set(canvaswidth - 2, canvasheight/2);
		world.CreateBody(bodyDef).CreateFixture(fixDef);

		// 添加移动头像
		addImageCircle();

	    //setup debug draw
	    // This is used to draw the shapes for debugging. Here the main purpose is to 
	    // verify that the images are in the right location 
	    // It also lets us skip the clearing of the display since it takes care of it.

	 // The refresh rate of the display. Change the number to make it go faster
	 z = window.setInterval(update2, (1000 / 60));

	function addImageCircle() {
    	// create a fixed circle - this will have an image in it
	 	// create basic circle
	 	var bodyDef = new b2BodyDef;
	 	var fixDef = new b2FixtureDef;
	 	fixDef.density = .5;//物体密度
	 	fixDef.friction = 0;//摩擦力
	 	fixDef.restitution = 1;//弹性

	 	var circleSize = 30;//圆圈半径

	 	var baseSpeed = 1000000;

	 	bodyDef.type = b2Body.b2_dynamicBody;
	 	scale = circleSize;//Math.floor(Math.random()*circleSize) + circleSize/2;
	 	fixDef.shape = new b2CircleShape(scale);

	 	bodyDef.position.x = scale*5;
	 	bodyDef.position.y = scale*5;
	 	var data = { imgsrc: img,
	 		imgsize: imgsize,
	 		bodysize: circleSize,
	 		name: "loverboy"
	 	}
	 	bodyDef.userData = data;

	 	var body = world.CreateBody(bodyDef).CreateFixture(fixDef);
		//body.GetBody().SetMassData(new b2MassData(new b2Vec2(0,0),0,50));
		body.GetBody().ApplyImpulse(
			new b2Vec2(Math.random()*baseSpeed,Math.random()*baseSpeed),
				body.GetBody().GetWorldCenter()
		);
	}

	 // Update the world display and add new objects as appropriate
	 function update2() {
	 	world.Step(1 / 60, 10, 10);
	 	context.clearRect(0,0,canvaswidth,canvasheight);
	 	world.ClearForces();

	 	processObjects();
	 }

	 // Draw the updated display
	 // Also handle deletion of objects
	 function processObjects() {
	 	var node = world.GetBodyList();
	 	//判断是否要删除发生了碰撞的weapon
	 	if(weapon.status == false){
	 		world.DestroyBody(weapon.obj);
	 		weapon.obj = null;
	 		weapon.status = true;
	 	}
	 	while (node) {
	 		var b = node;
	 		node = node.GetNext();
			var position = b.GetPosition();
			// Draw the dynamic objects
			if (b.GetType() == b2Body.b2_dynamicBody) {

				// Canvas Y coordinates start at opposite location, so we flip
				var flipy = canvasheight - position.y;
				var fl = b.GetFixtureList();
				if (!fl) {
					continue;
				}
				var shape = fl.GetShape();
				var shapeType = shape.GetType();
				// put an image in place if we store it in user data
				if (b.m_userData && b.m_userData.imgsrc) {
					// This "image" body destroys polygons that it contacts
					var edge = b.GetContactList();
					while (edge)  {
						var other = edge.other;
						if (other.GetType() == b2Body.b2_dynamicBody) {
							var othershape = other.GetFixtureList().GetShape();
							if (othershape.GetType() == b2Shape.e_polygonShape) {
								world.DestroyBody(other);
								break;	
							}
						}
						edge = edge.next;
					}

					// Draw the image on the object
					var size = b.m_userData.imgsize;
					var imgObj = new Image(size,size);
					imgObj.src = b.m_userData.imgsrc;
					context.save();
					// Translate to the center of the object, then flip and scale appropriately
					context.translate(position.x,flipy); 
					context.rotate(b.GetAngle());
					var s2 = -1*(size/2);
					var scale = b.m_userData.bodysize/-s2;
					context.scale(scale,scale);
					context.drawImage(imgObj,s2,s2);
					context.restore();
					//b.ApplyImpulse(new b2Vec2(6000,6000),new b2Vec2(0,0));
					//b.ApplyImpulse(new b2Vec2(6000,6000),b.GetWorldCenter());

				}

				 // draw a circle - a solid color, so we don't worry about rotation
				 else if (shapeType == b2Shape.e_circleShape) {
				 	context.strokeStyle = "#CCCCCC";
				 	context.fillStyle = "#FF8800";
				 	context.beginPath();
				 	context.arc(position.x,flipy,shape.GetRadius(),0,Math.PI*2,true);
				 	context.closePath();
				 	context.stroke();
				 	context.fill();
				 }

				 // draw a polygon 
				 else if (shapeType == b2Shape.e_polygonShape) {
				 	var vert = shape.GetVertices();
				 	context.beginPath();

					// Handle the possible rotation of the polygon and draw it
					b2Math.MulMV(b.m_xf.R,vert[0]);
					var tV = b2Math.AddVV(position, b2Math.MulMV(b.m_xf.R, vert[0]));
					context.moveTo(tV.x, canvasheight-tV.y);
					for (var i = 0; i < vert.length; i++) {
						var v = b2Math.AddVV(position, b2Math.MulMV(b.m_xf.R, vert[i]));
						context.lineTo(v.x, canvasheight - v.y);
					}
					context.lineTo(tV.x, canvasheight - tV.y);
					context.closePath();
					context.strokeStyle = "#CCCCCC";
					context.fillStyle = "#88FFAA";
					context.stroke();
					context.fill();
				}
			}
		}
	}

	/**
	 * 添加touch事件，在canvas特定区域生成子弹
	 * 
	 */
	$('#canvas').bind("touchend",function(e){
		//获取touch的坐标
		var touchPosition = getPointOnCanvas(canvaselem[0], e.changedTouches[0].pageX, e.changedTouches[0].pageY);
		//若超出可点范围，则不发射weapon
		if(touchPosition.y > 320 && weapon.status == true && weapon.obj == null){
			addWeapon(touchPosition);
		}
	});
	function addWeapon(touchPosition){
		// create Weapon
		var fixDef = new b2FixtureDef;
		fixDef.density = .5;
		fixDef.friction = 0;
		fixDef.restitution = 1;

		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_dynamicBody;
		scale = 20;//武器半径
		fixDef.shape = new b2CircleShape(scale);
		bodyDef.position.x = touchPosition.x;
		bodyDef.position.y = canvasheight- touchPosition.y;//canvas（左上角）和box2d（左下角）的原点不一样
		var data = { name: "weapon"};
		bodyDef.userData = data;
		var body = world.CreateBody(bodyDef).CreateFixture(fixDef);

		var weaponBaseSpeed = 1000000;
		body.GetBody().ApplyImpulse(
			new b2Vec2(0,weaponBaseSpeed),
				body.GetBody().GetWorldCenter()
		);
		weapon.obj = body.GetBody();//设置weapon
	}
	function getPointOnCanvas(canvas, x, y) {
		var bbox =canvas.getBoundingClientRect();
		return { 
			x: x- bbox.left * (canvas.width / bbox.width),
			y: y - bbox.top  * (canvas.height / bbox.height)
		};
	}

	/**
	 * 添加碰撞检测事件
	 */
	(function collisionDetect(){
		// Add listeners for contact
		var listener = new b2ContactListener;
		listener.BeginContact = function(contact) {
			var collisionA = contact.GetFixtureA().GetBody().GetUserData();//发生碰撞的两个物体之一
			var collisionB = contact.GetFixtureB().GetBody().GetUserData();//发生碰撞的另外一个物体

			var aName = (collisionA != undefined)?collisionA.name:"";
			var bName = (collisionB != undefined)?collisionB.name:"";
			
			//子弹打中了美男子
		    if ((aName == "loverboy" && bName == "weapon")
		            || (bName == "loverboy" && aName == "weapon")) {
		    	weapon.status = false;//将子弹设置为需要删除的状态
		    	$score.html(Number($score.html())+1);
		    }else if((aName == "roof" && bName == "weapon")
		            || (bName == "roof" && aName == "weapon")){
		    	weapon.status = false;//将子弹设置为需要删除的状态
		    	$(".result").removeClass("HIDE").find(".final-score").html($score.html());
		    	$score.html(0);
		    }
		}
		// set contact listener to the world
		world.SetContactListener(listener);
	})();
};