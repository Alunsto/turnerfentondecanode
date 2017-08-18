var db = require("../db");

var attendance = function() {

}

attendance.getLatestSession = function(callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback(err);
      return;
    }
    connection.query("SELECT id, optionA, optionB, optionC, optionD, answer, startTime, endTime, DATE_FORMAT(startTime, '%D of %M, %Y') AS date, createdBy FROM attendancesessions ORDER BY id DESC LIMIT 1;", function(err, rows, fields) {
      connection.release();
      if (err) {
        callback(err);
        return;
      }
      var sessionData = {
        id: rows[0].id,
        optionA: rows[0].optionA,
        optionB: rows[0].optionB,
        optionC: rows[0].optionC,
        optionD: rows[0].optionD,
        answer: rows[0].answer,
        startTime: rows[0].startTime,
        endTime: rows[0].endTime,
        date: rows[0].date,
        createdBy: rows[0].createdBy
      };
      callback(null, sessionData);
      return;
    });
  });
}

attendance.getSessionData = function(sessionid, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback(err);
      return;
    }
    connection.query("SELECT id, optionA, optionB, optionC, optionD, answer, startTime, endTime, DATE_FORMAT(startTime, '%D of %M, %Y') AS date, createdBy FROM attendancesessions WHERE id = ? ORDER BY id DESC;", [sessionid], function(err, rows, fields) {
      connection.release();
      if (err) {
        callback(err);
        return;
      }
      var sessionData = {
        id: rows[0].id,
        optionA: rows[0].optionA,
        optionB: rows[0].optionB,
        optionC: rows[0].optionC,
        optionD: rows[0].optionD,
        answer: rows[0].answer,
        startTime: rows[0].startTime,
        endTime: rows[0].endTime,
        date: rows[0].date,
        createdBy: rows[0].createdBy
      };
      callback(null, sessionData);
      return;
    });
  });
}

attendance.getSessionids = function(callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback(err);
      return;
    }
    connection.query("SELECT id, DATE_FORMAT(startTime, '%D of %M, %Y at %r') AS date FROM attendancesessions ORDER BY id DESC;", function(err, rows, fields) {
      connection.release();
      if (err) {
        callback(err);
        return;
      }
      var sessionids = [];
      for (var i = 0; i < rows.length; i++) {
        sessionids.push(
          {
            id: rows[i].id,
            date: rows[i].date
          }
        );
      }
      callback(null, sessionids);
      return;
    });
  });
}

attendance.getSessionResults = function(sessionid, callback) {
  db.pool.getConnection(function(err, connection) {
    if (err) {
      callback(err);
      return;
    }
    connection.query("SELECT studentNumber, firstName, lastName, decaCluster as cluster FROM members ORDER BY studentNumber", function(err, rows, fields) {
      if (err) {
        callback(err);
        return;
      }
      var users = [];
      for (var i = 0; i < rows.length; i++) {
        users.push(
          {
            studentNumber: rows[i].studentNumber,
            firstName: rows[i].firstName,
            lastName: rows[i].lastName,
            cluster: rows[i].cluster
          }
        );
      }
      connection.query("SELECT attendancerecords.id AS id, attendancerecords.studentNumber as studentNumber, firstName, lastName, decaCluster as cluster, correct FROM attendancerecords JOIN members ON members.studentNumber = attendancerecords.studentNumber WHERE attendanceSessionid = ? ORDER BY studentNumber", [sessionid], function(err, rows, fields) {
        connection.release();
        if (err) {
          callback(err);
          return;
        }
        var rawData = [];
        for (var i = 0; i < rows.length; i++) {
          rawData.push(
            {
              id: rows[i].id,
              studentNumber: rows[i].studentNumber,
              firstName: rows[i].firstName,
              lastName: rows[i].lastName,
              cluster: rows[i].cluster,
              correct: rows[i].correct
            }
          );
        }
        var sessionData = [];
        for (var i = 0; i <= rawData.length; i++) {
          if (users[i].studentNumber == rawData[0].studentNumber) {
            if (rawData[0].correct == true) {
              sessionData.push(
                {
                  studentNumber: rawData[0].studentNumber,
                  firstName: rawData[0].firstName,
                  lastName: rawData[0].lastName,
                  cluster: rawData[0].cluster,
                  present: true
                }
              );
            }
            else {
              i--;
            }
            rawData.splice(0, 1);
          }
          else {
            sessionData.push(
              {
                studentNumber: users[i].studentNumber,
                firstName: users[i].firstName,
                lastName: users[i].lastName,
                cluster: users[i].cluster,
                present: false
              }
            );
          }
        }
        callback(null, sessionData);
        return;
      });
    });
  });
}

module.exports = attendance;