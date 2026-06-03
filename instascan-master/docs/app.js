var app = new Vue({
  el: '#app',
  data: {
    scanner: null,
    activeCameraId: null,
    cameras: [],
    scans: []
  },
  mounted: function () {
    var self = this;
    self.scanner = new Instascan.Scanner({ video: document.getElementById('preview'), scanPeriod: 5, mirror: false, });
    self.scanner.addListener('scan', function (content, image) {
    // alert(content);
    window.open(document.querySelector(".base_url").innerText+'customer/scan/'+btoa(content),'_self');
    self.scans.unshift({ 
      date: +(Date.now()), 
      content: content 
      });
    });
    Instascan.Camera.getCameras().then(function (cameras) {
      self.cameras = cameras;
      if (cameras.length > 0) {
        self.activeCameraId = cameras[0].id;
        self.scanner.start(cameras[1]);
      } else {
        console.error('No cameras found.');
      }
    }).catch(function (e) {
      console.error(e);
    });
    // Instascan.Camera.getCameras().then(function (cameras) { 
    //   if (cameras.length > 0) {
    //       var selectedCam = cameras[0];
    //       $.each(cameras, (i, c) => {
    //           if (c.name.indexOf('back') != -1) {
    //               selectedCam = c;
    //               return false;
    //           }
    //       });

    //       scanner.start(selectedCam);
    //   } else {
    //       console.error('No cameras found.');
    //   }
    // }).catch(function (e) { 
    //   console.error(e); 
    // });
  },
  methods: {
    formatName: function (name) {
      return name || '(unknown)';
    },
    selectCamera: function (camera) {
      this.activeCameraId = camera.id;
      this.scanner.start(camera);
    }
  }
});
