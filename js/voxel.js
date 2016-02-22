(function () {
    var stats, scene, renderer, composer;
    var camera, cameraControl;
    var mask_color = 0;
    var geometry, surfacemesh, mesher = GreedyMesh;
    var view_names = [
        "leftCanvas"
        , "rightCanvas"
        , "topCanvas"
        , "bottomCanvas"
        , "frontCanvas"
        , "backCanvas"
    ];
    var select_names = [
        "leftSelect"
        , "rightSelect"
        , "topSelect"
        , "bottomSelect"
        , "frontSelect"
        , "backSelect"
    ];

    var buffer_xform = [
        [
            0, 1,
            1, 0
        ],
        [
            0, 1,
            1, 0
        ],
        [
            1, 0,
            0, 1
        ],
        [
            1, 0,
            0, 1
        ],
        [
            1, 0,
            0, 1
        ],
        [
            1, 0,
            0, 1
        ]
    ];
    var view_data = [];
    var dims = new Int32Array([16, 16, 16])
        , image_scale = 6
        , loadImage
        , clearSelected
        , fullRepaint;

//Unpack query string arguments
    var query_arguments = (function () {
        var query = window.location.search.substring(1)
            , result = {}
            , toks = query.split("&");
        for (var i = 0; i < toks.length; ++i) {
            var pair = toks[i].split('=');
            result[unescape(pair[0])] = unescape(pair[1]);
        }
        return result;
    })();

//Save-As feature
    window.saveAs = window.saveAs
    || window.webkitSaveAs
    || window.mozSaveAs
    || window.msSaveAs
    || window.open;

    function initializeCanvases() {
        var repaint_handlers = []
            , contexts = []
            , canvases = [];

        var current_mouse = [-1, -1, -1]
            , mouse_box = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1)
                , new THREE.MeshBasicMaterial({
                    color:       0xff0000
                    , wireframe: true
                }));

        scene.add(mouse_box);
        mouse_box.visible = false;

        function updateMouse(nmouse) {

            //Check for update
            if (nmouse) {
                var nochange = true;
                for (var i = 0; i < 3; ++i) {
                    if (current_mouse[i] != nmouse[i]) {
                        nochange = false;
                        break;
                    }
                }
                current_mouse[0] = nmouse[0];
                current_mouse[1] = nmouse[1];
                current_mouse[2] = nmouse[2];
                if (nochange) {
                    return;
                }
            }

            //Repaint screen
            for (var i = 0; i < 6; ++i) {
                contexts[i].fillStyle = '#ffffff';
                contexts[i].fillRect(0, 0, canvases[i].width, canvases[i].height);
            }

            if (current_mouse[0] < 0) {
                for (var i = 0; i < 6; ++i) {
                    repaint_handlers[i]();
                }
                mouse_box.visible = false;
                return;
            }

            var mat = buffer_xform[current_mouse[2]]
                , ray = [-1, -1, -1]
                , u = ((current_mouse[2] >> 1) + 1) % 3
                , v = ((current_mouse[2] >> 1) + 2) % 3;
            ray[u] = mat[0] * current_mouse[0] + mat[2] * current_mouse[1];
            ray[v] = mat[1] * current_mouse[0] + mat[3] * current_mouse[1];

            for (var i = 0; i < 6; ++i) {

                //Draw box
                var Q = buffer_xform[i];
                var ctx = contexts[i];
                ctx.fillStyle = '#FF0000';
                var a = ((i >> 1) + 1) % 3
                    , b = ((i >> 1) + 2) % 3
                    , iu = Q[0] * ray[a] + Q[1] * ray[b]
                    , iv = Q[2] * ray[a] + Q[3] * ray[b];
                ctx.fillRect(iu < 0 ? 0 : iu * image_scale
                    , iv < 0 ? 0 : iv * image_scale
                    , iu < 0 ? dims[a] * image_scale + 1 : image_scale + 1
                    , iv < 0 ? dims[b] * image_scale + 1 : image_scale + 1);
            }

            for (var i = 0; i < 6; ++i) {
                repaint_handlers[i]();
            }

            mouse_box.scale.x = ray[0] < 0 ? dims[0] : 1;
            mouse_box.scale.y = ray[1] < 0 ? dims[1] : 1;
            mouse_box.scale.z = ray[2] < 0 ? dims[2] : 1;

            mouse_box.position.x = (ray[0] >= 0 ? ray[0] - dims[0] / 2 + 0.5 : 0);
            mouse_box.position.y = (ray[1] >= 0 ? ray[1] - dims[1] / 2 + 0.5 : 0);
            mouse_box.position.z = (ray[2] >= 0 ? ray[2] - dims[2] / 2 + 0.5 : 0);

            mouse_box.visible = true;
        }

        for (var i = 0; i < 6; ++i)
            (function () {
                var d = i >> 1
                    , u = (d + 1) % 3
                    , v = (d + 2) % 3
                    , mat = buffer_xform[i]
                    , canvas = document.getElementById(view_names[i]);
                canvas.width = dims[u] * image_scale + 1;
                canvas.height = dims[v] * image_scale + 1;
                canvases.push(canvas);

                var index = i;

                //Create view data buffer
                var buffer = new Int32Array(dims[u] * dims[v]);
                for (var j = 0; j < buffer.length; ++j) {
                    buffer[j] = mask_color;
                }
                view_data.push(buffer);

                //Initialize context
                var ctx = canvas.getContext("2d");
                contexts.push(ctx);

                //Do repaint
                function repaint() {
                    for (var j = 0, n = 0; j < dims[v]; ++j)
                        for (var k = 0; k < dims[u]; ++k) {
                            var a = mat[0] * k + mat[1] * j
                                , b = mat[2] * k + mat[3] * j
                                , c = buffer[a + b * dims[u]];

                            ctx.fillStyle = 'rgb(' + ((c >> 16) & 0xff) + ',' + ((c >> 8) & 0xff) + ',' + (c & 0xff) + ')';
                            ctx.fillRect(k * image_scale + 1, j * image_scale + 1, image_scale - 1, image_scale - 1);
                        }
                };
                repaint();
                repaint_handlers.push(repaint);

                function mouseHandler(ev) {
                    var x = ev.offsetX
                        , y = ev.offsetY
                        , ix = Math.floor((x - 1) / image_scale)
                        , iy = Math.floor((y - 1) / image_scale)
                        , a = mat[0] * ix + mat[1] * iy
                        , b = mat[2] * ix + mat[3] * iy
                        , idx = a + b * dims[u];

                    if (ix < 0 || iy < 0) {
                        updateMouse([-1, -1, -1]);
                        return;
                    }

                    if (ev.which & 1) {
                        var paint_color = document.getElementById("paintColor").value
                            , paint_value = parseInt(paint_color, 16)
                        if (buffer[idx] !== paint_value) {
                            buffer[idx] = paint_value;
                            ctx.fillStyle = '#' + paint_color;
                            ctx.fillRect(ix * image_scale + 1, iy * image_scale + 1, image_scale - 1, image_scale - 1);
                            updateMesh();
                        }
                    }
                    if (ev.which & 2) {
                        var c = buffer[idx];
                        document.getElementById("paintColor").color.fromRGB(((c >> 16) & 0xff) / 255.0, ((c >> 8) & 0xff) / 255.0, (c & 0xff) / 255.0);
                        return true;
                    }

                    updateMouse([ix, iy, index]);
                }

                canvas.addEventListener('mousemove', mouseHandler, false);
                canvas.addEventListener('mousedown', mouseHandler, false);
                canvas.addEventListener('mouseleave', function () {
                    updateMouse([-1, -1, -1]);
                }, false);
                canvas.addEventListener('mouseout', function () {
                    updateMouse([-1, -1, -1]);
                }, false);
            })();

        //Initialize save/load buffer
        var buf_width = 0
            , buf_height = dims[0] + dims[1] + dims[2];
        for (var i = 0; i < 3; ++i) {
            buf_width = Math.max(buf_width, 2 * dims[(i + 1) % 3]);
        }

        //Create a hidden save buffer
        var save_buffer = document.createElement("canvas");
        save_buffer.style.visibility = "hidden";
        save_buffer.width = buf_width;
        save_buffer.height = buf_height;
        var save_context = save_buffer.getContext("2d");

        document.getElementById("saveImage").addEventListener('click', function () {
            //Unpack buffers into image
            var save_image = save_context.getImageData(0, 0, buf_width, buf_height);
            var row_start = 0;
            for (var d = 0; d < 3; ++d) {
                var u = (d + 1) % 3
                    , v = (d + 2) % 3;
                for (var s = 0; s < 2; ++s) {
                    var buffer = view_data[2 * d + s]
                        , n = 0;
                    for (var i = 0, row = row_start; i < dims[v]; ++i, ++row)
                        for (var j = 0, col = s * dims[u]; j < dims[u]; ++j, ++col, ++n) {
                            var idx = 4 * (col + row * buf_width);
                            for (var c = 0; c < 3; ++c) {
                                save_image.data[idx + 2 - c] = (buffer[n] >> (c * 8)) & 0xff;
                            }
                            save_image.data[idx + 3] = 0xff;
                        }
                }
                row_start += dims[u];
            }
            //Save image
            save_context.putImageData(save_image, 0, 0);
            window.saveAs(save_buffer.toDataURL());
        }, false);

        fullRepaint = function () {
            updateMouse();
            updateMesh();
        };

        //Called when an image loads
        loadImage = function (url) {
            if (url.charAt(url.length - 1) === '/') {
                url = url.substring(0, url.length - 1);
            }
            var img = new Image();
            img.src = url;
            img.onload = function () {
                save_context.drawImage(img, 0, 0, buf_width, buf_height);
                //Unpack pixels
                var save_image = save_context.getImageData(0, 0, buf_width, buf_height)
                    , row_start = 0;
                for (var d = 0; d < 3; ++d) {
                    var u = (d + 1) % 3
                        , v = (d + 2) % 3;
                    for (var s = 0; s < 2; ++s) {
                        var buffer = view_data[2 * d + s]
                            , n = 0;
                        for (var i = 0, row = row_start; i < dims[v]; ++i, ++row)
                            for (var j = 0, col = s * dims[u]; j < dims[u]; ++j, ++col, ++n) {
                                var idx = 4 * (col + row * buf_width)
                                    , value = 0;
                                for (var c = 0; c < 3; ++c) {
                                    value = (value << 8) | save_image.data[idx + c];
                                }
                                buffer[n] = value;
                            }
                    }
                    row_start += dims[u];
                }
                fullRepaint();
            }
        }

        clearSelected = function () {
            var bitmask = [];
            for (var i = 0; i < 6; ++i) {
                bitmask.push(document.getElementById(select_names[i]).checked);
            }

            //Compute new volume from partial views
            var volume = ShapeCarve(
                dims
                , view_data
                , mask_color
                , bitmask).volume;

            //Update images
            var x = [0, 0, 0];
            for (var d = 0; d < 3; ++d)
                for (var s = 0; s < 2; ++s) {
                    var vnum = 2 * d + s;
                    if (bitmask[vnum]) {
                        var u = (d + 1) % 3
                            , v = (d + 2) % 3
                            , n = 0
                            , aview = view_data[vnum];
                        for (x[v] = 0; x[v] < dims[v]; ++x[v])
                            for (x[u] = 0; x[u] < dims[u]; ++x[u], ++n) {
                                var start = 0
                                    , step = 1;
                                if (!!s) {
                                    start = dims[d] - 1;
                                    step = -1;
                                }
                                aview[n] = mask_color;
                                for (x[d] = start; 0 <= x[d] && x[d] < dims[d]; x[d] += step) {
                                    var c = volume[x[0] + dims[0] * (x[1] + dims[1] * x[2])];
                                    if (c !== mask_color && c !== 0xff00ff) {
                                        aview[n] = c;
                                        break;
                                    }
                                }
                            }
                    }
                }

            //Redraw mesh and edit panes
            fullRepaint();
        };
    }

    function updateMesh() {

        if (surfacemesh) {
            scene.remove(surfacemesh);
        }

        geometry = new THREE.Geometry();

        //Run shape carving1
        var volume = ShapeCarve(
                dims
                , view_data
                , mask_color
                , [false, false, false, false, false, false])
            , result = GreedyMesh(volume.volume, volume.dims);

        geometry.vertices.length = 0;
        geometry.faces.length = 0;
        for (var i = 0; i < result.vertices.length; ++i) {
            var q = result.vertices[i];
            geometry.vertices.push(new THREE.Vector3(q[0], q[1], q[2]));
        }
        for (var i = 0; i < result.faces.length; ++i) {
            var q = result.faces[i];
            if (q.length === 5) {
                var f = new THREE.Face4(q[0], q[1], q[2], q[3]);
                f.color = new THREE.Color(q[4]);
                f.vertexColors = [f.color, f.color, f.color, f.color];
                geometry.faces.push(f);
            } else if (q.length == 4) {
                var f = new THREE.Face3(q[0], q[1], q[2]);
                f.color = new THREE.Color(q[3]);
                f.vertexColors = [f.color, f.color, f.color];
                geometry.faces.push(f);
            }
        }

        geometry.verticesNeedUpdate = true;
        geometry.elementsNeedUpdate = true;

        //Create surface mesh
        var material = new THREE.MeshBasicMaterial({
            color:          0xffffff
            , vertexColors: THREE.VertexColors
            , shading:      THREE.FlatShading
        });
        surfacemesh = new THREE.Mesh(geometry, material);
        surfacemesh.doubleSided = false;

        surfacemesh.position.x = -dims[0] / 2.0;
        surfacemesh.position.y = -dims[1] / 2.0;
        surfacemesh.position.z = -dims[2] / 2.0;

        scene.add(surfacemesh);
    }

    if (!init())    animate();

// init the scene
    function init() {

        if (Detector.webgl) {
            renderer = new THREE.WebGLRenderer({
                antialias:             true,	// to get smoother output
                preserveDrawingBuffer: true	// to allow screenshot
            });
        } else {
            renderer = new THREE.CanvasRenderer();
        }
        renderer.setClearColorHex(0xBBBBBB, 1);

        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(renderer.domElement);

        // add Stats.js - https://github.com/mrdoob/stats.js
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        stats.domElement.style.right = '0px';
        document.body.appendChild(stats.domElement);

        // create a scene
        scene = new THREE.Scene();

        // put a camera in the scene
        camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.set(0, 0, -40);
        scene.add(camera);

        // create a camera contol
        cameraControls = new THREE.TrackballControls(camera, document.getElementById('container'))

        // transparently support window resize
        THREEx.WindowResize.bind(renderer, camera);
        // allow 'p' to make screenshot
        THREEx.Screenshot.bindKey(renderer);
        // allow 'f' to go fullscreen where this feature is supported
        if (THREEx.FullScreen.available()) {
            THREEx.FullScreen.bindKey();
            document.getElementById('inlineDoc').innerHTML += "- <i>f</i> for fullscreen";
        }

        //Handle larger images optionally
        if ('nx' in query_arguments) {
            dims[0] = parseInt(query_arguments['nx']);
        }
        if ('ny' in query_arguments) {
            dims[1] = parseInt(query_arguments['ny']);
        }
        if ('ny' in query_arguments) {
            dims[2] = parseInt(query_arguments['nz']);
        }

        //Initialize canvases
        initializeCanvases();

        if ('src' in query_arguments) {
            loadImage(query_arguments['src']);
        }

        updateMesh();

        document.getElementById("clearSelected").addEventListener("click", clearSelected, false);

        return false;
    }

// animation loop
    function animate() {

        // loop on request animation loop
        // - it has to be at the begining of the function
        // - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
        requestAnimationFrame(animate);

        // do the render
        render();

        // update stats
        stats.update();
    }

// render the scene
    function render() {
        // variable which is increase by Math.PI every seconds - usefull for animation
        var PIseconds = Date.now() * Math.PI;

        // update camera controls
        cameraControls.update();

        // actually render the scene
        renderer.render(scene, camera);
    }
})();