<script type="text/javascript" src="<?php echo base_url(); ?>webcam-take/webcam.min.js"></script>
<style>
#my_camera{
 width: 280px;
 height: 240px;
 border: unset;
 /*border: 1px solid #c1c1c1;*/
}
#results{
  margin-top: 10px;
  width: 140px;
  height: 120px;
}
.row {
  margin-bottom: 0px;
}
.modal.modal-fixed-footer .modal-content {
  padding: 10px;
}
.modal.modal-fixed-footer {
  height: 45%;
}
#tooltip_meter {
    opacity: unset;
    border-radius: 0px;
    color: white;
    display: none;
}
td, th {
    padding: 5px;
    font-size: 12px;
}
</style>
<div class="base_url" hidden><?php echo base_url(); ?></div>
<!-- <nav class="blue lighten-1">
  <div class="nav-wrapper">
    <a href="#" class="brand-logo" style="width: 90%;text-align: center;">ID : <?php echo base64_decode($this->uri->segment(3)) ?></a>
  </div>
</nav> -->
<div class="container" style="margin-bottom: 50px;">
  <div class="row">
    <form class="col s12" method="post" action="<?php echo base_url(); ?>transaksi/save_meter">
      <div class="row transparent_bg" style="margin-top: 10px;">
        <div class="input-field col s4">
          <center><img class="circle" src="<?php echo base_url(); ?>img/file_1509157371.png" style="border: 1px solid #ffffff1f;"><center>
        </div>
        <div class="input-field col s8">
          <h6><?php echo $data->nama; ?></h6>
          <small><b>Alamat :</b> <?php echo $data->alamat; ?></small><br>
          <small><b>Telp/Wa :</b> <?php echo $data->telp; ?></small><br>
          <small><b>Status :</b> <?php echo $data->status == 1 ? '<span style="float:unset" class="new badge" data-badge-caption="">aktif</span>' : '<span style="float:unset" class="new badge red" data-badge-caption="">block</span>' ?> </small><br>
          <small><b>Tipe :</b> <?php echo $data->tipe; ?></small><br>
        </div>
      </div>
      <div class="row transparent_bg">
        <div class="input-field col s12">
          <div class="divider"></div>
        </div>
      </div>
      <?php echo $this->session->flashdata('pesan');?>
      <div class="row transparent_bg">
        <div class="input-field col s12">
          <input id="jenis" name="jenis" type="text" value="<?php echo $data->tipe; ?>" hidden>
          <input id="customer_all" name="customer_all" type="text" value="<?php echo $data->id; ?>" hidden>
          <?php if (!empty($data_history->meter)){ ?>
          <input readonly id="meter_lama" name="meter_lama" type="text" class="validate" value="<?php echo $data_history->meter; ?>">
          <?php }else{ ?>
          <input readonly id="meter_lama" name="meter_lama" type="text" class="validate" value="0">
          <?php } ?>
          <label for="meter_lama">Meter Bulan Lalu</label>
        </div>
      </div>
      <div class="row transparent_bg">
        <div class="input-field col s12">
          <?php $meter_ = 0;
          if (!empty($data_history->meter)){
            $meter_ = $data_history->meter;
          } ?>
          <input id="meter_baru" name="meter_baru" type="number" class="validate" min="<?php echo $meter_; ?>" onkeyup="CalculateMeter(this, '<?php echo $data->tipe; ?>')" required>
          <label for="meter_baru">Meter Baru</label>          
        </div>
      </div>
      <div class="row transparent_bg">
        <div id="tooltip_meter" role="tooltip" style="opacity: unset; display: block;">
            <div>
              <table id="sortable-table-1" class="table table-bordered" style="background: #354168;">
                   <tbody>
                    <tr style="text-align:right;">
                      <td id="td_pad">PER M3</td>
                      <td id="td_pad">PEMAKAIAN</td>
                    </tr>
                    </tbody>
                    <tbody id="f_list_meter">
                      
                    </tbody>
              </table>
            </div>
          </div>
      </div>
      <div class="row">
        <div class="input-field col s12">
          <a class="modal-trigger waves-effect waves-light btn" type="button" id="open_cam_btn" href="#modal1"><i class="material-icons">photo_camera</i></a>
           <!-- <input class="waves-effect waves-light btn" type=button value="Save Snapshot" onClick="saveSnap()"> -->
        </div>
      </div>
      <div class="row">
        <div class="input-field col s12">
           <img id="results" src="" style="display:none;">
           <canvas style="display:none;"></canvas>
        </div>
      </div>
      <div class="row transparent_bg">
        <div class="input-field col s12">
          <input id="catatan_meter" name="catatan_meter" type="text">
          <label for="catatan_meter">Note / Catatan</label>          
        </div>
      </div>
      <div class="row">
        <div class="input-field col s12">
          <button class="waves-effect waves-light btn" type="submit" style="width: 100%">Cetak Meter</button>
        </div>
      </div>
    </form>
  </div>
</div>
<!-- Modal Trigger -->

<!-- Modal Structure -->
<div id="modal1" class="modal modal-fixed-footer" style="max-height: 400px;max-width: 300px;position: absolute !important;margin:none;">
  <div class="modal-content">
    <video id="stream_video" autoplay muted playsinline style="width:100%;"></video>
    <div id="my_camera" style="margin-bottom: 10px;display:none;"></div>
    <div class="select" style="display:none;">
      <label for="audioSource">Audio source: </label><select class="browser-default" id="audioSource"></select>
    </div>
  </div>
  <div class="modal-footer">
    <div class="row">
      <div class="input-field col s9" style="margin: 0px;">
        <select class="browser-default" id="videoSource">
          <!-- <option></option> -->
        </select>
      </div>
      <div class="input-field col s3" style="margin: 0px;">
        <a class="waves-effect waves-light btn modal-action modal-close" id="take_ss_btn" type="button" href="#!" style="margin: 3px 0;"><i class="material-icons">photo_camera</i></a>
      </div>
    </div>
  </div>
</div>
<div class="base_url" hidden><?php echo base_url(); ?></div>
<script type="text/javascript" src="<?php echo base_url(); ?>js/getusermedia.js"></script>
<script language="JavaScript">
var main_url = document.querySelector('.base_url').innerText;
const captureVideoButton = document.querySelector('#open_cam_btn');
const screenshotButton = document.querySelector('#take_ss_btn');
const img = document.querySelector('#results');
const video = document.querySelector('#stream_video');

const canvas = document.createElement('canvas');

captureVideoButton.onclick = function() {
  getStream();
};

screenshotButton.onclick = video.onclick = function() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  // Other browsers will fall back to image/png
  img.src = canvas.toDataURL('image/webp');
  img.style.display = 'block';

  setTimeout(function() {
      saveSnap();
  }, 550);
};

function handleSuccess(stream) {
  screenshotButton.disabled = false;
  video.srcObject = stream;
}

function saveSnap(){
 // Get base64 value from <img id='imageprev'> source
 var base64image = document.getElementById("results").src;

 Webcam.upload( base64image, document.querySelector(".base_url").innerText+'transaksi/save_foto_meter?customer='+document.querySelector("#customer_all").value, function(code, text) {
  console.log('Save successfully');
  //console.log(text);
 });

}

function CalculateMeter(elm, type){
  console.log(elm.value + '|||' +elm.value > document.querySelector('#meter_lama').value);
  var tot = '';
  tot = elm.value - document.querySelector('#meter_lama').value;
  if (tot > 0){
    getHargaMeter(type, tot);
  }
}

function convertToRupiah(angka){
  var rupiah = '';    
  var angkarev = angka.toString().split('').reverse().join('');
  for(var i = 0; i < angkarev.length; i++) if(i%3 == 0) rupiah += angkarev.substr(i,3)+'.';
  return ''+rupiah.split('',rupiah.length-1).reverse().join('');
}

function getHargaMeter(jenis, meter) {
      var data_meter = '';
      $.ajax({
          url: main_url +"customer/getTotalbyMeterAjax?get_jenis="+jenis+"&get_meter="+meter,
          type: 'GET',
          // data: data,
          contentType: false,
          async: false,
          // processData: false,
          dataType: "json",
          beforeSend: function(x) {
          },
          success: function(data) {
              console.log(data.total_biaya);
              data_meter=data.total_biaya;
              var data_list_meter = '';
              for (var i = 0; i < data.posts.length; i++) {
                qjml = convertToRupiah(data.posts[i].quantity.toString());
                qtotal = convertToRupiah(data.posts[i].total);
                if (data.posts[i].quantity > 0){
                  data_list_meter += `<tr style="text-align:right;">
                     <td id="td_pad">`+qjml+`</td>
                     <td id="td_pad">`+qtotal+`</td>
                   </tr>`
                }
              }

              data_list_meter += `<tr style="text-align:right;">
                <td id="td_pad">total (`+meter+` m3)</td>
                <td id="td_pad">`+convertToRupiah(data.total_biaya)+`</td>
              </tr>`
             
             document.querySelector('#f_list_meter').innerHTML = data_list_meter;
          },
          complete: function(data) {
          },
          error: function(data) {
              console.log('error while calculating data meter');
          }
      });

    return data_meter;
  }
 // configure();
 // Configure a few settings and attach camera
//  function configure(){
//   Webcam.set({
//    width: 280,
//    height: 240,
//    image_format: 'jpeg',
//    jpeg_quality: 90
//   });
//   Webcam.attach( '#my_camera' );
//  }
//  // A button for taking snaps


//  // preload shutter audio clip
//  var shutter = new Audio();
//  shutter.autoplay = false;
//  shutter.src = navigator.userAgent.match(/Firefox/) ? 'shutter.ogg' : 'shutter.mp3';

//  function take_snapshot() {
//   // play sound effect
//   shutter.play();

//   // take snapshot and get image data
//   Webcam.snap( function(data_uri) {
//   // display results in page
//   document.getElementById('results').innerHTML = 
//    '<img id="imageprev" src="'+data_uri+'"/>';
//   } );

//   Webcam.reset();
//  }

// function saveSnap(){
//  // Get base64 value from <img id='imageprev'> source
//  var base64image = document.getElementById("imageprev").src;

//  Webcam.upload( base64image, 'upload.php', function(code, text) {
//   console.log('Save successfully');
//   //console.log(text);
//  });

// }
</script>