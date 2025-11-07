<?php
class AgentProfile {
    private $conn;
    private $table = "agent_profiles";

    public $id;
    public $agent_id;
    public $date_of_birth;
    public $id_number;
    public $address;
    public $gender;
    public $education_level;
    public $referred_by;
    public $university_name;
    public $university_email;
    public $university_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    // ✅ Create or update profile (now includes university fields)
    public function upsert() {
        $query = "INSERT INTO " . $this->table . " 
                  (agent_id, date_of_birth, id_number, address, gender, education_level, referred_by, 
                   university_name, university_email, university_id)
                  VALUES (:agent_id, :date_of_birth, :id_number, :address, :gender, :education_level, :referred_by, 
                          :university_name, :university_email, :university_id)
                  ON DUPLICATE KEY UPDATE
                  date_of_birth = VALUES(date_of_birth),
                  id_number = VALUES(id_number),
                  address = VALUES(address),
                  gender = VALUES(gender),
                  education_level = VALUES(education_level),
                  referred_by = VALUES(referred_by),
                  university_name = VALUES(university_name),
                  university_email = VALUES(university_email),
                  university_id = VALUES(university_id)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":agent_id", $this->agent_id);
        $stmt->bindParam(":date_of_birth", $this->date_of_birth);
        $stmt->bindParam(":id_number", $this->id_number);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":gender", $this->gender);
        $stmt->bindParam(":education_level", $this->education_level);
        $stmt->bindParam(":referred_by", $this->referred_by);
        $stmt->bindParam(":university_name", $this->university_name);
        $stmt->bindParam(":university_email", $this->university_email);
        $stmt->bindParam(":university_id", $this->university_id);

        return $stmt->execute();
    }

    // Get profile by agent_id
    public function getByAgent($agent_id) {
        $query = "SELECT * FROM " . $this->table . " WHERE agent_id = :agent_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":agent_id", $agent_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
