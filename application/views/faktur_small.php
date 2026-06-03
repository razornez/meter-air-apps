
<html moznomarginboxes mozdisallowselectionprint>
    <head>
        <title>
            Kasir - Cetak Faktur</title>
        <style type="text/css">
            html {
                font-family: monospace;
            }
            .content {
                width: 60mm;
                font-size: 10px;
                padding: 5px;
            }
            .content .title {
                text-align: center;
            }
            .content .head-desc {
                margin-top: 10px;
                display: table;
                width: 100%;
            }
            .content .head-desc > div {
                display: table-cell;
            }
            .content .head-desc .user {
                text-align: right;
            }
            .content .nota {
                text-align: center;
                margin-top: 5px;
                margin-bottom: 5px;
            }
            .content .separate {
                margin-top: 10px;
                margin-bottom: 15px;
                border-top: 1px dashed #000;
            }
            .content .transaction-table {
                width: 100%;
                font-size: 10px;
            }
            .content .transaction-table .name {
                width: 185px;
            }
            .content .transaction-table .qty {
                text-align: center;
            }
            .content .transaction-table .sell-price, .content .transaction-table .final-price {
                text-align: right;
                width: 65px;
            }
            .content .transaction-table tr td {
                vertical-align: top;
            }
            .content .transaction-table .price-tr td {
                padding-top: 7px;
                padding-bottom: 7px;
            }
            .content .transaction-table .discount-tr td {
                padding-top: 7px;
                padding-bottom: 7px;
            }
            .content .transaction-table .separate-line {
                height: 1px;
                border-top: 1px dashed #000;
            }
            .content .thanks {
                margin-top: 15px;
                text-align: center;
            }
            .content .azost {
                margin-top:5px;
                text-align: center;
                font-size:10px;
            }
            @media print {
                @page  { 
                    width: 80mm;
                    margin: 0mm;
                }
            }

        </style>
    </head>
    <body onload="window.print();">
        <div class="content">
            <div class="title">
                <?php echo $this->Mconfig->get_config()->row()->perusahaan ?><br><?php echo $this->Mconfig->get_config()->row()->alamat ?>
            </div>

            <div class="head-desc">
                <div class="date">
                    <?php echo date('d M Y') ?></div>
                <div class="user">
                    <?php echo $this->session->userdata('fullname') ?>
                </div>
            </div>
            
            <div class="nota">
                <?php echo $faktur->row()->no_faktur ?>
            </div>

            <div class="separate"></div>

            <div class="transaction">
                <table class="transaction-table" cellspacing="0" cellpadding="0">
		            <?php if( ! empty($faktur)){    
				    	$no = 1;    
					    foreach($faktur->result() as $data) {
					    if($data->quantity == ''){$data->quantity = 0;}
					    if($data->diskon == ''){$data->diskon = 0;}
				    ?>
				    <tr>  
				    	<td class='name'><?php echo $data->produk ?></td>  
				    	<td class='qty'><?php echo $data->quantity ?></td>  
				    	<td class='sell-price'><?php echo number_format($data->harga_jual) ?></td>  
				    	<td class='final-price'><?php echo number_format($data->total) ?></td>
                    </tr>  
                    <?php }} ?>                  
                    <tr class="price-tr">
                        <td colspan="4">
                            <div class="separate-line"></div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" class="final-price">
                            Subtotal
                        </td>
                        <td class="final-price">
                            <?php echo number_format($data->subtotal) ?>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3" class="final-price">
                            Total                        
                        </td>
                        <td class="final-price">
                            <?php echo number_format($data->total_all) ?>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="thanks">
                ~~~ Terima Kasih ~~~
            </div>
            <div class="azost">
                <?php echo $this->Mconfig->get_config()->row()->perusahaan ?>
            </div>
        </div>
    </body>
</html>