<!-- <script type="text/javascript" src="<?php echo base_url(); ?>webcam-take/webcam.min.js"></script> -->
<script type="text/javascript" src="<?php echo base_url(); ?>js/adapter.min.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>js/vue.min.js"></script>
<script type="text/javascript" src="<?php echo base_url(); ?>instascan-master/instascan.min.js"></script>
<div class="base_url" hidden><?php echo base_url(); ?></div>
<div id="test-swipe-1" class="col s12" style="margin-bottom: 50px;">
  <!-- <nav class="blue lighten-1">
    <div class="nav-wrapper">
      <a href="#" class="brand-logo">SCAN</a>
    </div>
  </nav> -->
  <div class="col s12 m8 offset-m2 l6 offset-l3">
    <div class="card-panel grey lighten-5 z-depth-1" style="padding: 10px;position: absolute;margin: 27px 25px;z-index: 10;line-height: 15px;font-size: 13px;">
      <div class="row valign-wrapper" style="margin: 0px;">
        <div class="col s2">
          <i class="fa fa-qrcode medium"></i>
        </div>
        <div class="col s10">
          <span class="black-text">
            <small>Arahkan kamera menghadap ke barcode meter pelanggan, apabila tidak bisa menscan bisa mengetik manual di kolom "ID Pelanggan"</small>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="container" id="QR-Code" style="margin-top: 0px;">
      <div class="panel panel-info">
          <div class="panel-body text-center">
              <div class="col-md-6" style="display: none">
                  <center>
                    <div class="well" style="position: relative;display: inline-block;">
                        <canvas width="340" height="240" id="webcodecam-canvas"></canvas>
                        <div class="scanner-laser laser-rightBottom" style="opacity: 0.5;"></div>
                        <div class="scanner-laser laser-rightTop" style="opacity: 0.5;"></div>
                        <div class="scanner-laser laser-leftBottom" style="opacity: 0.5;"></div>
                        <div class="scanner-laser laser-leftTop" style="opacity: 0.5;"></div>
                    </div>
                  </center>
                  <div class="well" style="width: 100%;">
                      <label id="zoom-value" width="100">Zoom: 2</label>
                      <input id="zoom" onchange="Page.changeZoom();" type="range" min="10" max="30" value="0">
                      <label id="brightness-value" width="100">Brightness: 0</label>
                      <input id="brightness" onchange="Page.changeBrightness();" type="range" min="0" max="128" value="0">
                      <label id="contrast-value" width="100">Contrast: 0</label>
                      <input id="contrast" onchange="Page.changeContrast();" type="range" min="0" max="64" value="0">
                      <label id="threshold-value" width="100">Threshold: 0</label>
                      <input id="threshold" onchange="Page.changeThreshold();" type="range" min="0" max="512" value="0">
                      <label id="sharpness-value" width="100">Sharpness: off</label>
                      <input id="sharpness" onchange="Page.changeSharpness();" type="checkbox">
                      <label id="grayscale-value" width="100">grayscale: off</label>
                      <input id="grayscale" onchange="Page.changeGrayscale();" type="checkbox">
                      <br>
                      <label id="flipVertical-value" width="100">Flip Vertical: off</label>
                      <input id="flipVertical" onchange="Page.changeVertical();" type="checkbox">
                      <label id="flipHorizontal-value" width="100">Flip Horizontal: off</label>
                      <input id="flipHorizontal" onchange="Page.changeHorizontal();" type="checkbox">
                  </div>
              </div>

              <div class="panel-heading">
                  <!-- <div class="navbar-form navbar-left">
                      <h4>WebCodeCamJS.js Demonstration</h4>
                  </div> -->
                  <div class="navbar-form navbar-right">
                      <!-- <center><select class="form-control" id="camera-select" style="width:320px;"></select></center> -->
                      <div class="form-group" style="display: none">
                          <input id="image-url" type="text" class="form-control" placeholder="Image url">
                          <button title="Decode Image" class="btn btn-default btn-sm" id="decode-img" type="button" data-toggle="tooltip"><span class="glyphicon glyphicon-upload"></span></button>
                          <button title="Image shoot" class="btn btn-info btn-sm disabled" id="grab-img" type="button" data-toggle="tooltip"><span class="glyphicon glyphicon-picture"></span></button>
                          <button title="Play" class="btn btn-success btn-sm" id="play" type="button" data-toggle="tooltip"><span class="glyphicon glyphicon-play"></span></button>
                          <button title="Pause" class="btn btn-warning btn-sm" id="pause" type="button" data-toggle="tooltip"><span class="glyphicon glyphicon-pause"></span></button>
                          <button title="Stop streams" class="btn btn-danger btn-sm" id="stop" type="button" data-toggle="tooltip"><span class="glyphicon glyphicon-stop"></span></button>
                       </div>
                  </div>
              </div>

              <div class="row">
                <form class="col s12">
                  <div class="row transparent_bg">
                    <div class="input-field col s12">
                      <!-- <section class="cameras">
                        <h2>Cameras</h2>
                        <ul>
                          <li v-if="cameras.length === 0" class="empty">No cameras found</li>
                          <li v-for="camera in cameras">
                            <span v-if="camera.id == activeCameraId" :title="formatName(camera.name)" class="active">{{ formatName(camera.name) }}</span>
                            <span v-if="camera.id != activeCameraId" :title="formatName(camera.name)">
                              <a @click.stop="selectCamera(camera)">{{ formatName(camera.name) }}</a>
                            </span>
                          </li>
                        </ul>
                      </section>
                      <section class="scans">
                        <h2>Scans</h2>
                        <ul v-if="scans.length === 0">
                          <li class="empty">No scans yet</li>
                        </ul>
                        <transition-group name="scans" tag="ul">
                          <li v-for="scan in scans" :key="scan.date" :title="scan.content">{{ scan.content }}</li>
                        </transition-group>
                      </section> -->
                          <div class="preview-container">
                              <video id="preview" style="width:100%;"></video>
                          </div>
                      </div>
                      <!-- <label for="id_pelanggan">Pilih Kamera</label> -->
                    </div>
                  </div>
                  <div class="row transparent_bg">
                    <div class="input-field col s12">
                      <input placeholder="20xxxxxxxx" id="scanned-QR" type="text" class="validate">
                      <label for="id_pelanggan">ID Pelanggan</label>
                    </div>
                  </div>
                  <div class="row">
                    <div class="input-field col s12">
                      <a class="waves-effect waves-light btn" style="width: 100%" onclick="window.open('<?php echo base_url(); ?>customer/scan/'+btoa(document.getElementById('scanned-QR').value)+'','_self')">Scan Data</a>
                    </div>
                  </div>
                </form>
              </div>

              <div class="col-md-6">
                  <div class="thumbnail" id="result">
                      <div class="well" style="overflow: hidden;display: none;">
                          <img width="320" height="240" id="scanned-img" src="">
                      </div>
                      <div class="caption">
                          <h3 style="display:none;">Scanned result</h3>
                          <!-- <p id="scanned-QR"></p> -->
                      </div>
                  </div>
              </div>
          </div>
      </div>  
  </div>
</div>
<script type="text/javascript" src="<?php echo base_url(); ?>instascan-master/docs/app.js"></script>
<!-- <div id="test-swipe-2" class="col s12 red">Test 2</div> -->
<script type="text/javascript">
// configure();
// function configure(){
//   Webcam.set({
//    width: 320,
//    height: 240,
//    image_format: 'jpeg',
//    jpeg_quality: 90
//   });
//   Webcam.attach( '#webcodecam-canvas' );
//  }

 //Get select object
var objSelect = document.getElementById("camera-select");

//Set selected
// setSelectedValue(objSelect, "0");
function setSelectedValue(selectObj, valueToSet) {
    for (var i = 0; i < selectObj.options.length; i++) {
        if (selectObj.options[i].text== valueToSet) {
            selectObj.options[i].selected = true;
            return;
        }
    }
}
</script>
