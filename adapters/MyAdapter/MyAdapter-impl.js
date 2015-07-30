/**
* Copyright 2015 IBM Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
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
