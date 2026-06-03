<?php
class Mlogin extends CI_Model {

    public function __construct() {
        parent::__construct();
    }

    public function check_login($username, $pass) {
        $query = $this->db->query("select * from users where username='$username' and password='$pass' and is_active='1' ")->result();
        //var_dump($query); die;
        return ($query);
    }
    
}

?>