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
var busyInd;
function wlCommonInit() {
  busyInd = new WL.BusyIndicator ("content", {text: "Please wait..."});
  busyInd.show();
  WL.Client.connect({
    onSuccess: checkEnrollment
  });
}

function getBalance() {
	/*
	 * The REST API works with all adapters and external resources, and is supported on the following hybrid environments: 
	 * iOS, Android, Windows Phone 8, Windows 8. 
	 * 
	 * If your application supports other hybrid environments, see the "Invoking adapter procedures in Hybrid applications" for MobileFirst 6.3.
	 */
    var resourceRequest = new WLResourceRequest("/adapters/MyAdapter/getBalance", WLResourceRequest.GET, 30000);
	resourceRequest.send().then(
		function(response) {
		    $('.section').hide();
			$('#balanceBody').show();
			$('#balance').html(response.responseJSON.balance);
			$('#deviceId').html(response.responseJSON.deviceId);
			$('#logoutButton').show();
			$('#displayName').html(WL.Client.getUserName("EnrollmentRealm"));
		},
		function(error) {
			alert(JSON.stringify(error));
		}
	);
}

function getTransactions() {
	
	var resourceRequest = new WLResourceRequest("/adapters/MyAdapter/getTransactions", WLResourceRequest.GET, 30000);
	resourceRequest.send().then(
		function(response) {
	        var tbl_body = "";
			$.each(response.responseJSON.transactions, function(key, row) {
			    var tbl_row = "";
			    tbl_row += "<td>" + row.id + "</td>";
			    tbl_row += "<td>$" + row.amount + "</td>";
			    tbl_row += "<td>" + row.transaction_date + "</td>";

			    tbl_body += "<tr>" + tbl_row + "</tr>";
		    });
			
			$('.section').hide();
		    $("#transactions tbody").html(tbl_body);
		    $('#transactions').show();
		    $('#balanceBody').show();
		    $('#showTransactionsButton').hide();
		},
		function(error) {
			alert(JSON.stringify(error));
		}
	);
}

function logout() {
	var resourceRequest = new WLResourceRequest("/adapters/MyAdapter/removeDevice", WLResourceRequest.GET, 30000);
	resourceRequest.send().then(
		WL.Client.reloadApp,
		function(error) {
			alert(JSON.stringify(error));
		}
	);
}

//UsernamePasswordRealm
var usernamePasswordRealm = WL.Client.createChallengeHandler("UsernamePasswordRealm");
usernamePasswordRealm.isCustomResponse = function(response) {
  return response && response.responseJSON && response.responseJSON.usernamePasswordRequired;
};
usernamePasswordRealm.handleChallenge = function(response) {
  $('.section').hide();
  $('#loginBody').show();
  if (response.responseJSON.error) {
    alert(response.responseJSON.error);
  }
};

function login() {
  usernamePasswordRealm.submitAdapterAuthentication({
    adapter: 'MyAdapter',
    procedure: 'verifyUsernamePassword',
    parameters: [$('#username').val(), $('#password').val()]
  }, {
    onSuccess: function(response) {
      $('.section').hide();
      usernamePasswordRealm.submitSuccess();
    }
  });
}

//EnrollmentRealm
var enrollmentRealm = WL.Client.createChallengeHandler("EnrollmentRealm");
enrollmentRealm.isCustomResponse = function(response) {
  return response && response.responseJSON && response.responseJSON.enrollmentRequired;
};
enrollmentRealm.handleChallenge = function(response) {
	//This should not happen, we enroll pre-emptively
	WL.Client.reloadApp();
}

//Pre-emptively checks if the current device is enrolled
function checkEnrollment() {
  if (WL.Client.isUserAuthenticated("EnrollmentRealm")) {
    getBalance();
  } else {
	  var resourceRequest = new WLResourceRequest("/adapters/MyAdapter/checkEnrollment", WLResourceRequest.GET, 30000);
		resourceRequest.send().then(
			function(result) {
			    busyInd.hide();
                if (result.responseJSON.userId) {
			        getBalance();
			    } else {
			        WL.Client.login("UsernamePasswordRealm", {
			            onSuccess: function() {
			                $('.section').hide();
			                $('#enrollBody').show();
			            }
			         });
			    }
			},
			function(error) {
				alert(JSON.stringify(error));
			}
		);
  }
}

//Enroll a new device by setting a PIN code
function setPinCode() {
  if ($('#newPin').val() != "" && $('#newPin').val() == $('#repeatPin').val()) {
    
	  var resourceRequest = new WLResourceRequest("/adapters/MyAdapter/enroll", WLResourceRequest.GET, 30000);
	  var param = "['" + $('#newPin').val() + "']";
	  
	  resourceRequest.setQueryParameter("params", param);
	  resourceRequest.send().then(
			  function(response) {
			      $('.section').hide();
			      getBalance();
			  },
				function(error) {
					alert(JSON.stringify(error));
				}
      );
  } else {
    alert("Please enter the PIN code twice");
  }
}

//PinCodeRealm
var pinCodeRealm = WL.Client.createChallengeHandler("PinCodeRealm");
pinCodeRealm.isCustomResponse = function(response) {
  return response && response.responseJSON && response.responseJSON.pinCodeRequired;
};
pinCodeRealm.handleChallenge = function(response) {
  $('.section').hide();
  $('#checkPinCode').show();
  if (response.responseJSON.error) {
    alert(response.responseJSON.error);
  }
};

function verifyPinCode() {
  pinCodeRealm.submitAdapterAuthentication({
    adapter: 'MyAdapter',
    procedure: 'verifyPinCode',
    parameters: [$('#pin').val()]
  }, {
    onSuccess: function(response) {
      pinCodeRealm.submitSuccess();
    },
    onFailure: function(response) {
      alert("error");
    }
  });
}
