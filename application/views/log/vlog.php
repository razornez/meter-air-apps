<?php include '/../css_plus.html' ?>
  <!-- Content Wrapper. Contains page content -->
  <div class="content-wrapper"> 
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>Log<small>Manage</small></h1>
      <ol class="breadcrumb">
        <li><a href="<?php echo base_url(); ?>home"><i class="fa fa-dashboard"></i> Home</a></li>
        <li><a href="#"> Log</a></li>
        <li class="active"> Index</li>
      </ol>
    </section>
    
    <!-- Main content -->
    <section class="content container-fluid">
      <div class="row">
        <div class="col-md-12">
        <?php echo $this->session->flashdata('pesan');?>
        <a class="btn btn-app" href="#" class="btn btn-primary" disabled><i class="fa fa-plus"></i> Tambah Data</a>
        <a class="btn btn-app" onClick="printChart()" media="print" class="btn btn-primary"><i class="fa fa-print"></i> Print</a>
        <a class="btn btn-app" href="<?=base_url()?>log/cetak_lap_excel" class="btn btn-primary" target="_blank"><span class="badge bg-green"><?php echo $this->Mlog->count_data() ?> </span><i class="fa fa-list-alt"></i> Export .xls</a>
        <a class="btn btn-app" href="<?=base_url()?>log/print_pdf" class="btn btn-primary" target="_blank"><span class="badge bg-red"><?php echo $this->Mlog->count_data() ?> </span><i class="fa fa-file"></i> Export .pdf</a>
        <a class="btn btn-app" href="<?=base_url()?>log/delete" onclick="return confirm('Anda ingin melanjutkan untuk menghapus semua data log?')" class="btn btn-primary"><i class="fa fa-warning"></i> Hapus Semua</a><br>
          <div class="chart-box">
            <h4>Data Log</h4>
            <div class="box-tools">
            <form action="<?=base_url()?>log/cari" method="get">
                <div class="input-group">
                  <input type="text" name="key" class="form-control input-sm pull-right" style="width: 150px;" placeholder="Search"/>
                  <div class="input-group-btn">
                    <button class="btn btn-sm btn-default"><i class="fa fa-search"></i></button>
                  </div>
                </div>
            </form>
            </div>
            <div class="bs-example" data-example-id="simple-responsive-table">
            <div class="table-responsive" style="border: none;">
              <table class="table">
                <caption>
                Jumlah data keseluruhan <?php echo $this->Mlog->count_data() ?> Record 
                </caption>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Tanggal</th>
                    <th>Aktivitas</th>
                    <th>User</th>
                    <th>Jenis</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                <?php
                if(empty($datalog)){ ?>
                <tr>
                  <td colspan="6">Data tidak ditemukan</td>
                </tr>
                <?php }else{
                if(!$jlhpage){         //ini untuk menangani penomoran agar otomatis menyesuaikan dengan paging
                  $no=1;
                }else{$no=$jlhpage;}
                foreach ($datalog as $log) {
                ?>
                <tr>
                  <td><?php echo $no++; ?></td>
                  <td><?php echo $log->waktu; ?></td>
                  <td><?php echo $log->aktivitas; ?></td>
                  <td><?php echo $log->fullname; ?></td>
                  <td><?php echo $log->jenis; ?></td>
               </tr>
               <?php }} ?>
                </tbody>
              </table>
              </div>
            </div>
          </div>
          <?php
         echo $this->pagination->create_links();
         ?>
        </div>
      </div>
    </section>
    <!-- content --> 
  </div>

  <script type="text/javascript">
   function printChart(){

    var myParameters = window.location.search;// Get the parameters from the current page

    var URL = "log/cetak_view";

    var W = window.open(URL);

    W.window.print(); // Is this the right syntax ? This prints a blank page and not the above URL
    }
  </script>    