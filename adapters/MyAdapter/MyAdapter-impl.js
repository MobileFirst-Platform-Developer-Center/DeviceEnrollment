/*
*
    COPYRIGHT LICENSE: This information contains sample code provided in source code form. You may copy, modify, and distribute
    these sample programs in any form without payment to IBM® for the purposes of developing, using, marketing or distributing
    application programs conforming to the application programming interface for the operating platform for which the sample code is written.
    Notwithstanding anything to the contrary, IBM PROVIDES THE SAMPLE SOURCE CODE ON AN "AS IS" BASIS AND IBM DISCLAIMS ALL WARRANTIES,
    EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, ANY IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, SATISFACTORY QUALITY,
    FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND ANY WARRANTY OR CONDITION OF NON-INFRINGEMENT. IBM SHALL NOT BE LIABLE FOR ANY DIRECT,
    INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF THE USE OR OPERATION OF THE SAMPLE SOURCE CODE.
    IBM HAS NO OBLIGATION TO PROVIDE MAINTENANCE, SUPPORT, UPDATES, ENHANCEMENTS OR MODIFICATIONS TO THE SAMPLE SOURCE CODE.
*/
var userPwdRealm = "UsernamePasswordRealm";
var enrollmentRealm = "EnrollmentRealm";
var pinCodeRealm = "PinCodeRealm";
var enrolledDevices = com.ibm.sample.EnrolledDeviceStore;

function getBalance() {
  //Hardcoded balance
  return {
    balance: 500,
    deviceId: WL.Server.getCurrentDeviceIdentity().deviceId,
  };
}

function getTransactions() {
  //Dummy transactions

  return {
    transactions: [{
      id: 9001,
      transaction_date: '2014-09-03',
      amount: 100
    }, {
      id: 9002,
      transaction_date: '2014-09-04',
      amount: 50
    }, {
      id: 9003,
      transaction_date: '2014-09-05',
      amount: 150
    }]
  };
}

//UsernamePasswordRealm
function UsernamePasswordRequired() {
  return {
    usernamePasswordRequired: true,
  };
}

function verifyUsernamePassword(username, password) {
  if (username && password && username == password) {
    WL.Server.setActiveUser(userPwdRealm, {
      'userId': username
    });
    return {
      success: true
    };
  } else {
    return {
      success: false,
      usernamePasswordRequired: true,
      error: 'username and password must be the same and not empty'
    };
  }
}

//EnrollmentRealm
function enrollmentRequired() {
  return {
    enrollmentRequired: true
  };
}

function checkEnrollment() {
  var deviceId = WL.Server.getCurrentDeviceIdentity().deviceId;
  var enrollInfo = enrolledDevices.getInfo(deviceId);

  if (enrollInfo) {
    //Clean up if any
    WL.Server.setActiveUser(enrollmentRealm, null);
    //Log into the enrollment realm
    WL.Server.setActiveUser(enrollmentRealm, {
      'userId': enrollInfo.userId
    });
    
    return {"userId": enrollInfo.userId};
  }
  
  return {"userId": null};
}

function enroll(pin) {
  var deviceId = WL.Server.getCurrentDeviceIdentity().deviceId;
  var userId = WL.Server.getCurrentUserIdentity().userId;

  enrolledDevices.setInfo(deviceId, {
    'userId': userId,
    'pin': pin
  });
  WL.Server.setActiveUser(enrollmentRealm, {
    'userId': userId
  });

  return {
    'success': true
  };
}

function removeDevice() {
  var deviceId = WL.Server.getCurrentDeviceIdentity().deviceId;
  enrolledDevices.removeInfo(deviceId);
  WL.Server.setActiveUser(enrollmentRealm, null);
  WL.Server.setActiveUser(pinCodeRealm, null);
  WL.Server.setActiveUser(userPwdRealm, null);
}

//PinCodeRealm
function pinCodeRequired() {
  return {
    pinCodeRequired: true
  };
}

function verifyPinCode(pin) {
  var userId = WL.Server.getCurrentUserIdentity().userId;
  var deviceId = WL.Server.getCurrentDeviceIdentity().deviceId;
  var enrollInfo = enrolledDevices.getInfo(deviceId);

  if (enrollInfo && enrollInfo.pin == pin) {
    WL.Server.setActiveUser(pinCodeRealm, null);
    WL.Server.setActiveUser(pinCodeRealm, {
      'userId': userId
    });
    return {
      success: true
    };
  }

  return {
    success: false,
    pinCodeRequired: true,
    error: "Wrong PIN Code"
  };
}
