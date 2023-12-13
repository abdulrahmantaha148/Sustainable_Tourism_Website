// Load the Map and MapView modules
require([
    "esri/config", 
    "esri/Map", 
    "esri/views/MapView", 
    "esri/widgets/Locate",
    "esri/Graphic", 
    "esri/rest/locator",
    "esri/rest/route", 
    "esri/rest/support/RouteParameters",
    "esri/layers/FeatureLayer", 
    "esri/layers/GraphicsLayer",
    "esri/symbols/WebStyleSymbol",
    "esri/rest/support/FeatureSet", 
    "esri/rest/geoprocessor",
    "esri/rest/support/FeatureSet", 
    "esri/rest/support/TravelMode", 
    "esri/views/ui/DefaultUI",
    "esri/geometry/projection",
    "esri/geometry/SpatialReference", 
    "esri/rest/closestFacility", 
    "esri/widgets/Home", 
    "esri/rest/support/ClosestFacilityParameters"

],
    function (esriConfig, Map, MapView, 
        Locate, Graphic, locator, route, 
        RouteParameters, FeatureLayer, 
        GraphicsLayer, WebStyleSymbol,
        FeatureSet, geoprocessor, FeatureSet, 
        TravelMode, DefaultUI, projection, 
        SpatialReference, closestFacility, Home, 
        ClosestFacilityParam
    ) {
        let drawHandler, defaultViewClickHandler, originGraphic, attractionsSelect;
        var firstRenderSideBar = false;
        let loadingDiv = document.getElementById("loadingDiv");
        let endjourneyDiv = document.getElementById("endjourney");

        // esriConfig.apiKey = "AAPK545cd6269f5d4d6e92b8a95212e2e813aQm_tHkFuQhDjnRQPfMh4VqliMplbo3AbbY3EX8tZVATTiFJ_tvQxZdIMVK6oTaE";
        //graphicsLayer for pin point on map
        const graphicsLayer = new GraphicsLayer({
            id: "tempGraphics"
        });

        const mainRouteLayer = new GraphicsLayer({
            id: "mainRouteLayer"
        });
        const branchRouteLayer = new GraphicsLayer({
            id: "branchRouteLayer"
        });
        const pointRouteLayer = new GraphicsLayer({
            id: "pointRouteLayer"
        });

        // Create a Map instance
        var myMap = new Map({
            basemap: "osm",
            language: "ar",
            layers: [graphicsLayer, mainRouteLayer, branchRouteLayer, pointRouteLayer],
        });
        // Create a MapView instance (for 2D viewing) and reference the map instance
        var myview = new MapView({
            map: myMap,  // References a Map instance
            container: "viewDiv", // References the ID of a DOM element
            center: [29.9, 31.2],
            zoom: 12,
        });
        //////// add widgets ////////////
          /////////////////////////////////////////////////////////////////////

          let homeWidget = new Home({
            view: myview
        });

        // adds the home widget to the top left corner of the MapView
        myview.ui.add(homeWidget, "bottom-right");

        ////////////////////////////////////

        ////////add location
        var userlocation = new Locate({
            view: myview,   // Attaches the Locate button to the view
            graphic: new Graphic({
                symbol: { type: "simple-marker" }  // overwrites the default symbol used for the
                //graphic placed at the location of the user when found
            })
        })
        myview.ui.move(["zoom", userlocation], "bottom-trailing");
        myview.ui.add(userlocation, "bottom-right");
        ////////////////////////////////////////

        ////////////////////////////////////add layer////////////////////////////////
        var mypopup = {
            title: "{Name}",
            content: `
  
            <img src='{Path}';></img>
            <br>
            <audio src='{recording}' controls>
            
            </audio>
            <br>
            <h3 style="color: blue;">Description :</h3>
            <h5 style="color: red;">{Description}</h5>
            <br><br>
            <div style="width: 350px;">
            <span class="heading">User Rating</span>
            <span class="fa fa-star checked"></span>
            <span class="fa fa-star checked"></span>
            <span class="fa fa-star checked"></span>
            <span class="fa fa-star checked"></span>
            <span class="fa fa-star"></span>
            <p>4.1 average based on 254 reviews.</p>
            <hr style="border:3px solid #f1f1f1">
        
            <div class="row">
              <div class="side">
                <div>5 star</div>
              </div>
              <div class="middle">
                <div class="bar-container">
                  <div class="bar-5"></div>
                </div>
              </div>
              <div class="side right">
                <div>150</div>
              </div>
              <div class="side">
                <div>4 star</div>
              </div>
              <div class="middle">
                <div class="bar-container">
                  <div class="bar-4"></div>
                </div>
              </div>
              <div class="side right">
                <div>63</div>
              </div>
              <div class="side">
                <div>3 star</div>
              </div>
              <div class="middle">
                <div class="bar-container">
                  <div class="bar-3"></div>
                </div>
              </div>
              <div class="side right">
                <div>15</div>
              </div>
              <div class="side">
                <div>2 star</div>
              </div>
              <div class="middle">
                <div class="bar-container">
                  <div class="bar-2"></div>
                </div>
              </div>
              <div class="side right">
                <div>6</div>
              </div>
              <div class="side">
                <div>1 star</div>
              </div>
              <div class="middle">
                <div class="bar-container">
                  <div class="bar-1"></div>
                </div>
              </div>
              <div class="side right">
                <div>20</div>
              </div>
            </div>
            <br>
            <div>
              <h5>visitor numbers : 55</h5>
              <h5>Rate the attraction : <a href="https://arcg.is/1D8PH5">https://arcg.is/1D8PH5</a></h5>
            </div>
          </div>
            `,
            overwriteActions: true
            // ["{Description}","{path}"]

        }
        var attractionLayer = new FeatureLayer({
            url: "https://services8.arcgis.com/KoIzcsvMfmaIZSW9/ArcGIS/rest/services/Alexandria_Touristic_Map_WFL1/FeatureServer/18",
            popupTemplate: mypopup,
        })
        myMap.add(attractionLayer)
        addDefaultViewClickHandler();
      
        ///////////////////////////////////////////////////////////////

        ////////////////////// adding dropdown list of attractions //////////////////

        const places = [{ name: "Choose a place type. (All)", value: "1=1" }, { name: "Cultural", value: 1 }, { name: "Historical", value: 2 }, { name: "Entertainment", value: 3 }, { name: "Recreational", value: 4 }, { name: "Foods and Drinks", value: 5 }];

        const select = document.createElement("select");
        select.setAttribute("class", "esri-widget esri-select");
        select.setAttribute("style", "width: 175px; font-family: 'Avenir Next W00'; font-size: 1em");

        places.forEach((p) => {
            const option = document.createElement("option");
            option.value = p.value;
            option.innerHTML = p.name;
            select.appendChild(option);
        });
        getAttractionsFromServer("1=1")

        select.addEventListener('change', function (event) {
            console.log(event.target.value);
            let classificationValue = event.target.value;
            if (classificationValue === "1=1") {
                attractionLayer.definitionExpression = "1=1";
                getAttractionsFromServer(attractionLayer.definitionExpression)
            }
            else {
                attractionLayer.definitionExpression = "Classification=" + classificationValue;
                getAttractionsFromServer(attractionLayer.definitionExpression)
            }
        })

        myview.ui.add(select, "top-right");
         //functions [helpers]
        //get attraction names
        function renderSelectAttractionElement(attractionsFeatures) {
            // [{name: "atttr1", value:"attr1"}, {}]
            let reqAttractions = attractionsFeatures.map(function (item) {
                return {
                    name: item.attributes.Name,
                    value: item.attributes.Name
                }
            })
            const attractionsPlaces = [{ name: "Choose a attraction from list", value: "" }, ...reqAttractions];
            if (!attractionsSelect) {
                // debugger
                attractionsSelect = document.createElement("select");
                attractionsSelect.setAttribute("class", "esri-widget esri-select");
                attractionsSelect.setAttribute("style", "width: 175px; font-family: 'Avenir Next W00'; font-size: 1em");

                //select on side bar 
                var attchoose = document.getElementById("attractios");

                attractionsPlaces.forEach((p) => {
                    const option = document.createElement("option");
                    option.value = p.value;
                    option.innerHTML = p.name;
                    attractionsSelect.appendChild(option);

                    if (firstRenderSideBar === false) attchoose.appendChild(option.cloneNode(true));
                });
                if (firstRenderSideBar === false) {
                    attchoose.addEventListener('change', function (event) {
                        let name = event.target.value;
                        console.log(name);
                        let requiredAttr = attractionsFeatures.find(function (place) {
                            if (place.attributes.Name === name) return place;
                            else return false
                        });
                        //zoom to feature
                        myview.goTo({
                            target: requiredAttr.geometry,
                            zoom: 14
                        })

                        attractionLayer.definitionExpression = `Name='${name}'`
                        // add stop
                        addStop(requiredAttr.geometry, "firstStop")
                        console.log(requiredAttr);
                    })
                }
                firstRenderSideBar = true;
                attractionsSelect.addEventListener('change', function (event) {
                    let name = event.target.value;
                    let reqFeature = attractionsFeatures.find(function (feature) {
                        return feature.attributes.Name === name

                    });
                    console.log(name, reqFeature);
                    //zoom to feature
                    myview.goTo({
                        target: reqFeature.geometry,
                        zoom: 16
                    })
                })
                myview.ui.add(attractionsSelect, "top-right");
            } else {
                attractionsSelect.innerHTML = "";
                attractionsPlaces.forEach((p) => {
                    const option = document.createElement("option");
                    option.value = p.value;
                    option.innerHTML = p.name;
                    attractionsSelect.appendChild(option);

                });
            }


        }
        function getAttractionsFromServer(where) {
            let query = attractionLayer.createQuery();
            query.where = where;
            query.outFields = ["Name"];

            attractionLayer.queryFeatures(query)
                .then(function (response) {
                    console.log(response);
                    let features = response.features;
                    renderSelectAttractionElement(features)
                });
        }
        ////////////////////// adding dropdown list of attractions //////////////////



        ///////////////// adding current location to map //////////////////
        let originBtns = document.querySelectorAll('.origin-btn-icon');
        originBtns.forEach(originBtn => {
            originBtn.addEventListener('click', function () {
                if (originBtn.classList.contains('active')) {
                    originBtn.classList.remove('active');
                    drawHandler.remove();
                    addDefaultViewClickHandler();

                }
                else {
                    originBtn.classList.add('active')
                    //diactivate the default view handler 
                    defaultViewClickHandler.remove();
                    // activate on click for myview to draw
                    addDrawHandler();
                }
            })

        })
         //functions [helpers]
        function handleDrawOriginPoint(point) {
            // First create a point geometry (this is the location of the Titanic)

            const selectedWebStyleSymbol = new WebStyleSymbol({
                name: "esri-pin-1",
                styleName: "Esri2DPointSymbolsStyle"
            });
            const webStyleSymbol = new WebStyleSymbol({
                name: "tear-pin-1",
                styleName: "Esri2DPointSymbolsStyle"
            });

            // Create a graphic and add the geometry and symbol to it
            const pointGraphic = new Graphic({
                geometry: point,
                symbol: webStyleSymbol
            });
            originGraphic = pointGraphic;
            console.log({ originGraphic });
            const stop = (evt) => evt.stopPropagation();

            const updateGraphic = (event, symbol = selectedWebStyleSymbol) => {
                pointGraphic.geometry = myview.toMap(event);
                pointGraphic.symbol = symbol;
                originGraphic = pointGraphic;
                console.log({ originGraphic }, graphicsLayer.graphics.items[0]);
            };

            const cleanUp = (event) => {
                console.log("done moving graphic");
                updateGraphic(event, webStyleSymbol);
                handlers.forEach((a) => a.remove());
                handlers.length = 0;
            };

            // Add the graphic to the view's graphics layer
            graphicsLayer.add(pointGraphic);
            addStop(pointGraphic.geometry);
            // createBufferFromGP(pointGraphic)
            const handlers = [];

            myview.on("hold", ({ mapPoint }) => {
                myview.hitTest(myview.toScreen(mapPoint)).then((hitResult) => {
                    if (!hitResult.results[0].graphic) return;
                    console.log("hold event, now drag mouse to move graphic");
                    pointGraphic.symbol = selectedWebStyleSymbol;
                    const pausePan = myview.on("drag", stop);
                    const move = myview.on("pointer-move", updateGraphic);
                    const up = myview.on("pointer-up", cleanUp);
                    handlers.push(pausePan);
                    handlers.push(move);
                    handlers.push(up);
                });
            });

        }
        function addDefaultViewClickHandler() {

            defaultViewClickHandler = myview.on("click", function (event) {
                // event is the event handle returned after the event fires.
                console.log(event.mapPoint);
                if (myview.zoom == 12) { var zoomu = 14 }
                else { var zoomu = 16 }

                myview.goTo({
                    center: [event.mapPoint.longitude, event.mapPoint.latitude],
                    zoom: zoomu
                }, {
                    duration: 2000
                });


            });

        }
        function addDrawHandler() {
            drawHandler = myview.on('click', function (event) {
                if (graphicsLayer.graphics?.length == 1) return

                // event is the event handle returned after the event fires.
                let point = {
                    type: "point", // autocasts as new Point()
                    longitude: event.mapPoint.longitude,
                    latitude: event.mapPoint.latitude
                };

                handleDrawOriginPoint(point);

            })
        }
        ///////////////// adding current location to map //////////////////

        //////////////// routing code //////////////////////////

        var routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World"

        var routeParams = new RouteParameters({
            directionsLanguage: "ar",
            returnDirections: true,
            defaultTargetFacilityCount: 2,
            directionsLengthUnits: "kilometers",
            travelDirection: "from-facility",
            restrictionAttributes: "walking",
            outputGeometryPrecisionUnits: "kilometers",
            directionsTimeAttribute: "walk-time",
            stops: new FeatureSet(),
        })

        async function getRoute(mode) {
            loadingDiv.classList.add("visible");



            route.solve(routeUrl, routeParams).then(function (rou) {
                loadingDiv.classList.remove("visible");


                var routeLine = rou.routeResults[0].route

                routeLine.symbol = {
                    type: "simple-line",
                    color: "#d78063",
                    width: 4,
                    style: "short-dot"


                }
                routeLine.attributes.id = "line1";
                let isRouteExist = myview.graphics.items.find(function (line) {
                    if (line.attributes.id === "line1") return line;
                    else return false
                });

                if (isRouteExist) myview.graphics.remove(isRouteExist);
                myview.graphics.add(routeLine)
                console.log(rou)
                if (mode === "on foot") {
                    var wlen = parseFloat(rou.routeResults[0].directions.totalLength).toFixed(2)
                    var wmin =parseFloat( wlen * 60 / 6).toFixed(2)
                    var para = document.getElementById("lengthtimecontainer");
                    para.innerHTML = `
                    <div style="width:fit-content; height:fit-content; color:#d78063; font-size: 25px; background:gray ; position:absolute;bottom: 17rem;  right: 4rem;border: 1px solid #ccc;
                    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
                    border-radius: 5px;
                    background-color: #5d86a241;" >
                        <div>
                            <label for="">Length: ${wlen} K.M </label>
                           
                        </div>
                        <div>
                            <label for="">time: ${wmin} min</label>
                            
                        </div>
                    </div>`;

                    var totallen = parseFloat(wlen).toFixed(2)
                    var totaltim = parseFloat(wmin).toFixed(2)
                    var savecal = parseFloat(23 * wlen).toFixed(2)
                    var saveco2 = parseFloat(250 * wlen).toFixed(2)
                    var savemoney = parseFloat(3 * wlen + 12).toFixed(1)
                    let objectToSetInLocalStorage = {
                        totallen,
                        totaltim,
                        savecal,
                        saveco2,
                        savemoney
                    };
                    localStorage.setItem("tripData", JSON.stringify(objectToSetInLocalStorage))


                } else {
                    var wlen = parseFloat(rou.routeResults[0].directions.totalLength).toFixed(2)
                    var wmin = parseFloat(wlen * 60 / 20).toFixed(2)
                    var para = document.getElementById("lengthtimecontainer");
                    para.innerHTML = `
                    <div style="width:fit-content; height:fit-content; color:#d78063; font-size: 25px; background:gray ; position:absolute;bottom: 17rem;  right: 4rem;border: 1px solid #ccc;
                    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
                    border-radius: 5px;
                    background-color: #5d86a241;" >
                        <div>
                            <label for="">Length: ${wlen} K.M </label>
                           
                        </div>
                        <div>
                            <label for="">time: ${wmin} min</label>
                            
                        </div>
                    </div>`;

                    var totallen = parseFloat(wlen).toFixed(2)
                    var totaltim = parseFloat(wmin).toFixed(2)
                    var savecal = parseFloat(23 * wlen).toFixed(2)
                    var saveco2 = parseFloat(250 * wlen).toFixed(2)
                    var savemoney = parseFloat(3 * wlen + 12).toFixed(1)
                    let objectToSetInLocalStorage = {
                        totallen,
                        totaltim,
                        savecal,
                        saveco2,
                        savemoney
                    };
                    localStorage.setItem("tripData", JSON.stringify(objectToSetInLocalStorage))

                    myMap.add(stopstramLayers)
                    var popupreport = {
                        title: "{InceptionType}",
                        content: `{RiskDegree}`
                    }
                    var RiskReportslayer = new FeatureLayer({
                        url: "https://services5.arcgis.com/P5DKrSzlTNnAdaF1/arcgis/rest/services/Inceptions/FeatureServer",
                        popupTemplate: popupreport
                    })
                    myMap.add(RiskReportslayer)
        
                }

                endjourneyDiv.classList.remove('hidden')


            })
        }
        function addStop(pt, stopProperties = "") {
            var myGraphic = new Graphic({
                geometry: pt,
                attributes: {
                    id: stopProperties       //firstStop, secondStop
                },
                symbol: {
                    type: "simple-marker",
                    color: "red",
                    style: "cross",
                    size: 15
                },
            })
            // remove from [myview.graphics] 
            let isFirstStopExistingInView = myview.graphics.items.find(function (gr) {
                if (gr.attributes.id === stopProperties) return gr;
                else return false;
            })
            //if existing, remove from myview
            if (isFirstStopExistingInView) myview.graphics.remove(isFirstStopExistingInView);
            // if not add it to myview
            myview.graphics.add(myGraphic)
            // remove from stops
            let isFirstStopExistingOnStops = routeParams.stops.features.find(function (gr) {
                if (gr.attributes.id === stopProperties) return gr;
                else return false;
            })
            if (isFirstStopExistingOnStops) {
                //find index
                let index = routeParams.stops.features.findIndex(function (gr) {
                    if (gr.attributes.id === stopProperties) return gr;
                    else return false;
                })
                routeParams.stops.features.splice(index, 1);
            }
            routeParams.stops.features.push(myGraphic)
            // if (routeParams.stops.features.length == 2) getRoute()

        }

        ////////////////////////////////////////gp////////////////////////////////////////

        // //network 
        function getBusGpToolResults(inputs, gpurl) {

            var routebusesLayers = new FeatureLayer({
                url: "https://services8.arcgis.com/KoIzcsvMfmaIZSW9/ArcGIS/rest/services/Alexandria_Touristic_Map_WFL1/FeatureServer/10",
            })
            myMap.add(routebusesLayers)

            var mypopup = {
                title: "{Name}",
            }

            var stopsbusesLayers = new FeatureLayer({
                url: "https://services8.arcgis.com/KoIzcsvMfmaIZSW9/ArcGIS/rest/services/Alexandria_Touristic_Map_WFL1/FeatureServer/9",
                popupTemplate: mypopup,
            })
            myMap.add(stopsbusesLayers)




            let featureSet = new FeatureSet();
            // 
            let outSpatialReference = new SpatialReference({
                wkid: 3857
            });
            featureSet.features = [...inputs];
            featureSet.features.forEach(function (graphic) {
                graphic.geometry = projection.project(graphic.geometry, outSpatialReference);
            });

            loadingDiv.classList.add("visible");

            geoprocessor.execute(gpurl, {
                Model1_Model1_Feature_Set__Points___Points_: featureSet,
                Output_Layer__3_: "Output_Layer__3_",
                Output_Layer: "Output_Layer",
                Output_Layer__4_: "Output_Layer__4_"
            }).then(function (result) {
                console.log({ result: result });

                loadingDiv.classList.remove("visible");

                let mainRouteData = result.results[0].value.features[0];
                let mainPolylineSymbol = {
                    type: "simple-line",  // autocasts as SimpleLineSymbol()
                    color: "#7fa1ad",
                    width: 6
                };
                let secondBranchRoutesymbol = {
                    type: "simple-line",  // autocasts as SimpleLineSymbol()
                    color: "#d78063",
                    width: 5,
                    style: "short-dot"
                };
                let pointBranchRoutesembol = {
                    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                    style: "x",
                    color: [226, 119, 40],
                    size: "8px",  // pixels
                    outline: {  // autocasts as new SimpleLineSymbol()
                        color: [255, 255, 0],
                        width: 4  // points
                    }
                };
                let mainRoute = new Graphic({
                    geometry: mainRouteData.geometry,
                    symbol: mainPolylineSymbol,
                    // attributes: 
                })
                mainRouteLayer.add(mainRoute)


                let branchRoutesData = result.results[1].value.features;
                branchRoutesData.forEach(branchR => {
                    let secondBranchRoute = new Graphic({
                        geometry: branchR.geometry,
                        symbol: secondBranchRoutesymbol,
                        // attributes: 
                    })
                    branchRouteLayer.add(secondBranchRoute)

                })
                let pointsData = result.results[2].value.features;
                pointsData.forEach(pointR => {
                    let pointBranchRoute = new Graphic({
                        geometry: pointR.geometry,
                        symbol: pointBranchRoutesembol,
                        // attributes: 
                    })
                    pointRouteLayer.add(pointBranchRoute)

                })

                myMap.layers.reorder(branchRouteLayer, 100)
                myMap.layers.reorder(mainRouteLayer, 150)
                myMap.layers.reorder(pointRouteLayer, 151)

                endjourneyDiv.classList.remove('hidden')


                var lens1 = parseFloat(parseFloat((result.results[1].value.features[1].attributes.Total_Length) / 1000).toFixed(1))
                var tims1 = parseFloat(parseFloat(result.results[1].value.features[1].attributes.Total_walkingtime).toFixed(1))

                var lenmode = parseFloat(parseFloat((result.results[0].value.features[0].attributes.Total_Length) / 1000).toFixed(1))
                var timmode = parseFloat(parseFloat(result.results[0].value.features[0].attributes.Total_bustime).toFixed(1))

                var len2 = parseFloat(parseFloat((result.results[1].value.features[0].attributes.Total_Length) / 1000).toFixed(1))
                var tim2 = parseFloat(parseFloat(result.results[1].value.features[0].attributes.Total_walkingtime).toFixed(1))

                var totallen = parseFloat(lens1 + len2 + lenmode).toFixed(2)
                var totaltim = parseFloat(tims1 + tim2 + timmode).toFixed(2)
                var savecal = parseFloat(23 * (len2 + lens1)).toFixed(2)
                var saveco2 = parseFloat(250 * totallen).toFixed(2)
                var savemoney = parseFloat(3 * totallen + 12).toFixed(1)
                let objectToSetInLocalStorage = {
                    totallen,
                    totaltim,
                    savecal,
                    saveco2,
                    savemoney
                };
                localStorage.setItem("tripData", JSON.stringify(objectToSetInLocalStorage))

                var para = document.getElementById("lengthtimecontainer");
                para.innerHTML = `
                <div style="width:290px; height:fit-content; background:gray ; position:absolute;bottom: 25rem;  right: 5.5rem; top:10rem; border: 1px solid #ccc;
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
                border-radius: 5px; color:#d78063; font-size: 18px;
                background-color: #5d86a241;" >
                     <div>
                            <label for="">walking distant of frist stop:${lens1} K.M</label>
                            <br>
                            <label for=""> walking time of frist stop:${tims1} min</label>
                     </div>
                     <br>
                    <div>
                         <label for="">first stop:${result.results[2].value.features[1].attributes.Name}</label>
                         <br>
                         <label for="">bus distant:${lenmode} K.M</label>
                         <br>
                         <label for="">bus time:${timmode} min</label>
                         <br>
                         <label for="">end stop:${result.results[2].value.features[0].attributes.Name}</label>
                    </div>
                    <br>
                    <div>
                        <label for="">walking distant from end stop to attraction:${len2} K.M</label>
                        <br>
                        <label for=""> walking time from end stop to attraction:${tim2} min</label>
                    </div>
                </div>`;


            }).catch(function (err) {
                console.log({ err });
            })


        }


        function getcyclingGpToolResults(inputs, gpurl) {


            var routetramLayers = new FeatureLayer({
                url: "https://services8.arcgis.com/KoIzcsvMfmaIZSW9/ArcGIS/rest/services/Alexandria_Touristic_Map_WFL1/FeatureServer/14",
            })
            myMap.add(routetramLayers)

            var mypopup = {
                title: "{Name}",
            }
            var stopstramLayers = new FeatureLayer({
                url: "https://services8.arcgis.com/KoIzcsvMfmaIZSW9/ArcGIS/rest/services/Alexandria_Touristic_Map_WFL1/FeatureServer/17",
                popupTemplate: mypopup,
            })
            myMap.add(stopstramLayers)
            var popupreport = {
                title: "{InceptionType}",
                content: `{RiskDegree}`
            }
            var RiskReportslayer = new FeatureLayer({
                url: "https://services5.arcgis.com/P5DKrSzlTNnAdaF1/arcgis/rest/services/Inceptions/FeatureServer",
                popupTemplate: popupreport
            })
            myMap.add(RiskReportslayer)


            loadingDiv.classList.add("visible");

            let featureSet = new FeatureSet();
            // 
            let outSpatialReference = new SpatialReference({
                wkid: 3857
            });
            featureSet.features = [...inputs];
            featureSet.features.forEach(function (graphic) {
                graphic.geometry = projection.project(graphic.geometry, outSpatialReference);
            });
            geoprocessor.execute(gpurl, {
                Model1_Model1_Feature_Set__Points___Points_: featureSet,
                Output_Layer: "Output_Layer",
                Output_Layer__3_: "Output_Layer__3_",
                Output_Layer__4_: "Output_Layer__4_"
            }).then(function (result) {
                console.log({ result: result });

                loadingDiv.classList.remove("visible");

                let mainRouteData = result.results[1].value.features[0];
                let mainPolylineSymbol = {
                    type: "simple-line",  // autocasts as SimpleLineSymbol()
                    color: "#5c86a3",
                    width: 6
                };
                let secondBranchRoutesymbol = {
                    type: "simple-line",  // autocasts as SimpleLineSymbol()
                    color: "#9e5a44",
                    width: 8,
                    style: "short-dot"
                };
                let pointBranchRoutesembol = {
                    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                    style: "x",
                    color: "red",
                    size: "8px",  // pixels
                    outline: {  // autocasts as new SimpleLineSymbol()
                        color: [255, 255, 0],
                        width: 4  // points
                    }
                };
                let mainRoute = new Graphic({
                    geometry: mainRouteData.geometry,
                    symbol: mainPolylineSymbol,
                    // attributes: 
                })
                mainRouteLayer.add(mainRoute)


                let branchRoutesData = result.results[0].value.features;
                branchRoutesData.forEach(branchR => {
                    let secondBranchRoute = new Graphic({
                        geometry: branchR.geometry,
                        symbol: secondBranchRoutesymbol,
                        // attributes: 
                    })
                    branchRouteLayer.add(secondBranchRoute)

                })
                let pointsData = result.results[2].value.features;
                pointsData.forEach(pointR => {
                    let pointBranchRoute = new Graphic({
                        geometry: pointR.geometry,
                        symbol: pointBranchRoutesembol,
                        // attributes: 
                    })
                    pointRouteLayer.add(pointBranchRoute)

                })

                myMap.layers.reorder(branchRouteLayer, 100)
                myMap.layers.reorder(mainRouteLayer, 150)
                myMap.layers.reorder(pointRouteLayer, 151)

                endjourneyDiv.classList.remove('hidden')

                var lens1 = parseFloat(parseFloat((result.results[0].value.features[1].attributes.Total_Length) / 1000).toFixed(1))
                var tims1 = parseFloat(result.results[0].value.features[1].attributes.Total_walkingtime).toFixed(1)

                var lenmode = parseFloat((result.results[1].value.features[0].attributes.Total_Length) / 1000).toFixed(1)
                var timmode = parseFloat(result.results[1].value.features[0].attributes.Total_cyclingtime).toFixed(1)

                var len2 = parseFloat(parseFloat((result.results[0].value.features[0].attributes.Total_Length) / 1000).toFixed(1))
                var tim2 = parseFloat(result.results[0].value.features[0].attributes.Total_walkingtime).toFixed(1)

                var totallen = parseFloat(lens1 + len2 + lenmode).toFixed(2)
                var totaltim = parseFloat(tims1 + tim2 + timmode).toFixed(2)
                var savecal = parseFloat(23 * (len2 + lens1)).toFixed(2)
                var saveco2 = parseFloat(250 * totallen).toFixed(2)
                var savemoney = parseFloat(3 * totallen + 12).toFixed(2)

                let objectToSetInLocalStorage = {
                    totallen,
                    totaltim,
                    savecal,
                    saveco2,
                    savemoney
                };
                localStorage.setItem("tripData", JSON.stringify(objectToSetInLocalStorage))



                var para = document.getElementById("tramcontainer");
                para.innerHTML = `
                <div style="width:280px; height:fit-content; background:gray ; position:absolute;bottom: 25rem;  right: 5.5rem; top:10rem; border: 1px solid #ccc;
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
                border-radius: 5px; color:#d78063; font-size: 18px;
                background-color: #5d86a241;" >
                     <div>
                            <label for="">walking distant of frist stop:${lens1} K.M</label>
                            <br>
                            <label for=""> walking time of frist stop:${tims1} min</label>
                     </div>
                     <br>
                    <div>
                         <label for="">first stop:${result.results[2].value.features[1].attributes.Name}</label>
                         <br>
                         <label for="">cycling distant:${lenmode} K.M</label>
                         <br>
                         <label for="">cycling time:${timmode} min</label>
                         <br>
                         <label for="">end stop:${result.results[2].value.features[0].attributes.Name}</label>
                    </div>
                    <br>
                    <div>
                        <label for="">walking distant from end stop to attraction:${len2} K.M</label>
                        <br>
                        <label for=""> walking time from end stop to attraction:${tim2} min</label>
                    </div>
                </div>`;





            }).catch(function (err) {
                console.log({ err });
            })
        }


        function gettramGpToolResults(inputs, gpurl) {
           

            var routetramLayers = new FeatureLayer({
                url: "https://services8.arcgis.com/KoIzcsvMfmaIZSW9/ArcGIS/rest/services/Alexandria_Touristic_Map_WFL1/FeatureServer/5",
            })
            myMap.add(routetramLayers)
            var mypopup = {
                title: "{Name}",
                }
            var stopstramLayers = new FeatureLayer({
                url: "https://services8.arcgis.com/KoIzcsvMfmaIZSW9/ArcGIS/rest/services/Alexandria_Touristic_Map_WFL1/FeatureServer/4",
                popupTemplate: mypopup,
            })
            myMap.add(stopstramLayers)

            loadingDiv.classList.add("visible");

            let featureSet = new FeatureSet();
            // 
            let outSpatialReference = new SpatialReference({
                wkid: 3857
            });
            featureSet.features = [...inputs];
            featureSet.features.forEach(function (graphic) {
                graphic.geometry = projection.project(graphic.geometry, outSpatialReference);
            });
            geoprocessor.execute(gpurl, {
                tramup_Model1_Model1_Feature_Set__Points___Points___Points_: featureSet,
                Output_Layer: "Output_Layer",
                Output_Layer__3_: "Output_Layer__3_",
                Output_Layer__4_: "Output_Layer__4_",
            }).then(function (result) {
                console.log({ result: result });

                ///loading
                loadingDiv.classList.remove("visible");



                let mainRouteData = result.results[1].value.features[0];
                let mainPolylineSymbol = {
                    type: "simple-line",  // autocasts as SimpleLineSymbol()
                    color: "#2a698f",
                    width: 6
                };

                let secondBranchRoutesymbol = {
                    type: "simple-line",  // autocasts as SimpleLineSymbol()
                    color: "#d78063",
                    width: 6,
                    style: "short-dot"
                };
                let pointBranchRoutesembol = {
                    type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                    style: "x",
                    color: "red",
                    size: "8px",  // pixels
                    outline: {  // autocasts as new SimpleLineSymbol()
                        color: [255, 255, 0],
                        width: 4  // points
                    }
                };
                let mainRoute = new Graphic({
                    geometry: mainRouteData.geometry,
                    symbol: mainPolylineSymbol,
                    // attributes: 
                })
                mainRouteLayer.add(mainRoute)


                let branchRoutesData = result.results[0].value.features;
                branchRoutesData.forEach(branchR => {
                    let secondBranchRoute = new Graphic({
                        geometry: branchR.geometry,
                        symbol: secondBranchRoutesymbol,
                        // attributes: 
                    })
                    branchRouteLayer.add(secondBranchRoute)

                })
                let pointsData = result.results[2].value.features;
                pointsData.forEach(pointR => {
                    let pointBranchRoute = new Graphic({
                        geometry: pointR.geometry,
                        symbol: pointBranchRoutesembol,
                        // attributes: 
                    })
                    pointRouteLayer.add(pointBranchRoute)

                })

                myMap.layers.reorder(branchRouteLayer, 100)
                myMap.layers.reorder(mainRouteLayer, 150)
                myMap.layers.reorder(pointRouteLayer, 151)

                endjourneyDiv.classList.remove('hidden')

                var lens1 = parseFloat(parseFloat((result.results[0].value.features[1].attributes.Total_Length) / 1000).toFixed(1))
                var tims1 = parseFloat(result.results[0].value.features[1].attributes.Total_walkingtime).toFixed(1)

                var lenmode = parseFloat((result.results[1].value.features[0].attributes.Total_Length) / 1000).toFixed(1)
                var timmode = parseFloat(result.results[1].value.features[0].attributes.Total_tramtime).toFixed(1)

                var len2 = parseFloat(parseFloat((result.results[0].value.features[0].attributes.Total_Length) / 1000).toFixed(1))
                var tim2 = parseFloat(result.results[0].value.features[0].attributes.Total_walkingtime).toFixed(1)

                var totallen = parseFloat(lens1 + len2 + lenmode).toFixed(2)
                var totaltim = parseFloat(tims1 + tim2 + timmode).toFixed(2)
                var savecal = parseFloat(23 * (len2 + lens1)).toFixed(2)
                var saveco2 = parseFloat(250 * totallen).toFixed(2)
                var savemoney = parseFloat(3 * totallen + 12).toFixed(2)

                let objectToSetInLocalStorage = {
                    totallen,
                    totaltim,
                    savecal,
                    saveco2,
                    savemoney
                };
                localStorage.setItem("tripData", JSON.stringify(objectToSetInLocalStorage))


                var para = document.getElementById("tramcontainer");
                para.innerHTML = `
                <div style="width:280px; height:fit-content; background:gray ; position:absolute;bottom: 25rem;  right: 5.5rem; top:10rem; border: 1px solid #ccc;
                box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
                border-radius: 5px; color:#d78063; font-size: 18px;
                background-color: #5d86a241;" >
                     <div>
                            <label for="">walking distant of frist stop:${lens1} K.M</label>
                            <br>
                            <label for=""> walking time of frist stop:${tims1} min</label>
                     </div>
                     <br>
                    <div>
                         <label for="">first stop:${result.results[2].value.features[1].attributes.Name}</label>
                         <br>
                         <label for="">tram distant:${lenmode} K.M</label>
                         <br>
                         <label for="">tram time:${timmode} min</label>
                         <br>
                         <label for="">end stop:${result.results[2].value.features[0].attributes.Name}</label>
                    </div>
                    <br>
                    <div>
                        <label for="">walking distant from end stop to attraction:${len2} K.M</label>
                        <br>
                        <label for=""> walking time from end stop to attraction:${tim2} min</label>
                    </div>
                </div>`;



            })
            // .catch(function (err) {
            //     console.log({ err });
            // })
        }

        //////////////  ///////////////////////
        let submitBtn = document.getElementById("submit-btn");
        let modesSelect = document.getElementById("modes");

        submitBtn.addEventListener('click', function () {
            if (routeParams.stops.features.length == 2) {

                if (modesSelect.value === "on foot") getRoute(modesSelect.value)

                else if (modesSelect.value === "E-bus") getBusGpToolResults(routeParams.stops.features, "https://localhost:6443/arcgis/rest/services/busesGp/busesfinallyup/GPServer/buses")
                else if (modesSelect.value === "cycling") {
                    //if he has a bike
                    let radioBtnValue = document.querySelector("input[name=bike]:checked").value;
                    if (radioBtnValue === "yes") {
                        getRoute(modesSelect.value);

                    }
                    else {
                        // if he hasn't bike
                        getcyclingGpToolResults(routeParams.stops.features, "https://localhost:6443/arcgis/rest/services/cyclingalexGp/cyclingalexup/GPServer/cycling")
                    }
                }
                else if (modesSelect.value === "tram") gettramGpToolResults(routeParams.stops.features, "https://localhost:6443/arcgis/rest/services/alextramGp/alextramup11/GPServer/tramup")
            }
        })



        function getmaintenanceGpToolResults(gpurl) {
            var mypopup = {
                title: "{Name}",
            }
            var maintenanceLayers = new FeatureLayer({
                url: "https://services8.arcgis.com/KoIzcsvMfmaIZSW9/ArcGIS/rest/services/Alexandria_Touristic_Map_WFL1/FeatureServer/12",
                popupTemplate: mypopup,
            })
            myMap.add(maintenanceLayers)

            loadingDiv.classList.add("visible");

            let featureSet = new FeatureSet();
            // 
            let outSpatialReference = new SpatialReference({
                wkid: 3857
            });
            featureSet.features = [originGraphic];
            featureSet.features.forEach(function (graphic) {
                graphic.geometry = projection.project(graphic.geometry, outSpatialReference);
            });
            geoprocessor.execute(gpurl, {
                Variable_Feature_Set__Points_: featureSet,
                Output_Layer: "Output_Layer",

            }).then(function (result) {
                console.log({ result: result });

                //loadin
                loadingDiv.classList.remove("visible");

                let mainPolylineSymbol = {
                    type: "simple-line",  // autocasts as SimpleLineSymbol()
                    color: "#5c86a3",
                    width: 4
                };


                let branchRoutesData = result.results[0].value.features;
                branchRoutesData.forEach(branchR => {
                    let secondBranchRoute = new Graphic({
                        geometry: branchR.geometry,
                        symbol: mainPolylineSymbol,
                        // attributes: 
                    })
                    branchRouteLayer.add(secondBranchRoute)

                    var lenroute1 = parseFloat(result.results[0].value.features[0].attributes.Total_Length).toFixed(2)
                    var lenroute2 = parseFloat(result.results[0].value.features[1].attributes.Total_Length).toFixed(2)
                    var timeroute1 = parseFloat(result.results[0].value.features[0].attributes.Total_walktime).toFixed(2)
                    var timeroute2 = parseFloat(result.results[0].value.features[1].attributes.Total_walktime).toFixed(2)

                    var para = document.getElementById("lengthshopcontainer");
                    para.innerHTML = `
                    <div style="width:fit-content; height:fit-content; color:#d78063; font-size: 22px; background:gray ;
                     position:absolute;bottom: 30rem; left:25rem; top:3rem; border: 1px solid #ccc;
                    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
                    border-radius: 5px;
                    background-color: #5d86a241;" >
                        <div>
                            <label for="">Length of first way:${lenroute1} meter </label>
                            <br>
                            <label for="">time of first way:${timeroute1} min</label>
                        </div>
                        <br>
                        <div>
                        <label for="">Length of sec way:${lenroute2} meter </label>
                        <br>
                            <label for="">time of sec way:${timeroute2} min</label>
                        </div>
                    </div>`;


                })

            }).catch(function (err) {
                console.log({ err });
            })
        }
        var maintenanceBtn = document.getElementById("maintenance");
        maintenanceBtn.addEventListener('click', function () {
            getmaintenanceGpToolResults("https://localhost:6443/arcgis/rest/services/cyclingalexGp/maintenance/GPServer/maintenance")
        })



        function getClosestFacilityCyclingCommunityHelpers(myGraphic) {

            var mypopup = {
                title: "{Creator}",
                content: `{gender}
                <br>
                {type_your_mobile_number}
                <br>
                {type_your_name}
                {Attachments}
                `}
            var CyclingCommunityHelpers = new FeatureLayer({
                url: "https://services5.arcgis.com/P5DKrSzlTNnAdaF1/ArcGIS/rest/services/survey123_6309e27f55b84b34bb0424939362a218_results/FeatureServer/0",
                popupTemplate:mypopup,
            })
            myMap.add(CyclingCommunityHelpers)

            loadingDiv.classList.add("visible");

            CyclingCommunityHelpers.queryFeatures().then(function (features) {

                var ClosestFacilityParameters = new ClosestFacilityParam({
                    directionsLanguage: "en",
                    returnDirections: true,
                    defaultTargetFacilityCount: 2,
                    directionsLengthUnits: "kilometers",
                    travelDirection: "from-facility",
                    restrictionAttributes: "walking",
                    outputGeometryPrecisionUnits: "kilometers",
                    directionsTimeAttribute: "walk-time",
                    facilities: features,
                    incidents: new FeatureSet(),
                })
                ClosestFacilityParameters.incidents.features.push(myGraphic)

                var url = "https://route-api.arcgis.com/arcgis/rest/services/World/ClosestFacility/NAServer/ClosestFacility_World"


                closestFacility.solve(url, ClosestFacilityParameters).then(function (solveResult) {
                    // Do something with the solveResults here
                    console.log(solveResult)
                    // loading
                    loadingDiv.classList.remove("visible");

                    var routeLines = solveResult.routes.features;
                    routeLines.forEach(function (routeLine) {

                        routeLine.symbol = {
                            type: "simple-line",
                            color: "#806663",
                            size: 5,
                            width: 4
                        }

                        myview.graphics.add(routeLine)
                    })
                    var lenr1 = parseFloat(solveResult.directions[0].totalLength).toFixed(1)
                    var timer1 = parseFloat(solveResult.directions[0].totalTime).toFixed(1)
                    var lenr2 = parseFloat(solveResult.directions[1].totalLength).toFixed(1)
                    var timer2 = parseFloat(solveResult.directions[1].totalTime).toFixed(1)

                    var para = document.getElementById("lenghthelpcontainer");
                    para.innerHTML = `
                    <div style="width:fit-content; height:fit-content; color:#d78063; font-size: 22px; background:gray ;
                     position:absolute;bottom: 30rem; left:48rem; top:3rem; border: 1px solid #ccc;
                    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3);
                    border-radius: 5px;
                    background-color: #5d86a241;" >
                        <div>
                            <label for="">Length of first way:${lenr1} meter</label>
                            <br>
                            <label for="">time of first way:${timer1} min</label>
                        </div>
                        <br>
                        <div>
                        <label for="">Length of sec way:${lenr2} meter</label>
                        <br>
                            <label for="">time of sec way:${timer2} min</label>
                        </div>
                    </div>`;


                }).catch(function (err) {
                    console.log({ err });
                })
            }).catch(function (err) {
                console.log({ err });
            })

        }

        function addincidents(originGraphic) {

            myview.graphics.add(originGraphic)
            getClosestFacilityCyclingCommunityHelpers(originGraphic)

        }

        let helpBtn = document.getElementById("help");
        helpBtn.addEventListener('click', function () {
            addincidents(originGraphic)
        })

    });


