function decodeAjaxErrorMessage(x, exception) {
    var message;
    var statusErrorMap = {
        '400': "Server understood the request, but request content was invalid."
        , '401': "Unauthorized access."
        , '403': "Forbidden resource can't be accessed."
        , '404': "Resource not found."
        , '500': "Internal server error."
        , '503': "Service unavailable."
    };
    if (x.status == 0 && x.statusText == "error") {
        message = "Connection to the target server refused.\nCheck the HTTP server availability and reload the page";
    } else if (x.statusText == "cannotconnect") {
        message = "Cannot connect to the target server.\nCheck the HTTP server availability and reload the page"
    } else if (exception == 'parsererror') {
        message = "Error.\nParsing JSON Request failed.";
    } else if (exception == 'timeout') {
        message = "Request Timeout.";
    } else if (exception == 'abort') {
        message = "Request was aborted by the server";
    } else if (x.status) {
        message = statusErrorMap[x.status];
        if (message) {
            return message;
        }
    } else message = "Unknown Error \n" + x.statusText;
    return message;
}

function displayMessage(info) {
    $("#update-result-message-data").text(info.replace(/\r\n/g, "\n"));
    $("#update-result-message").dialog({
        modal: true
        , buttons: {
            Ok: function () {
                $(this).dialog("close");
            }
        }
    });
}

var customer_protobuf_handler = null;
var customer_list_protobuf_handler = null;
var updatemsg_protobuf_handler = null;

protobuf.load("customer.proto", function (err, root) {
    if (err) {
     displayMessage(err);
     return;
    }
    // Obtain protobuf message handlers
    customer_list_protobuf_handler = root.lookupType("custbufs.Customers");
    customer_protobuf_handler = root.lookupType("custbufs.Customer");
    updatemsg_protobuf_handler = root.lookupType("custbufs.UpdateStatus");
});

var maninfo = function (id, first_name, family_name, email, phone, birth_date) {
    var self = this;
    self.id = ko.observable(id);
    self.firstName = ko.observable(first_name);
    self.lastName = ko.observable(family_name);
    self.email = ko.observable(email);
    self.mobile = ko.observable(phone);
    self.dateOfBirth = ko.observable(birth_date);

}

var gridViewModel = function () {
    var self = this;
    self.customerslist = ko.observableArray([]);
    console.log("sending ajax req to retrieve customer list data");
    $.ajax({
        type: "GET",
        dataType: 'binary',
        responseType: 'arraybuffer',
        contentType: "application/x-protobuf",
        processData: false,
        url: '/spring-protobuf/customers-protobuf',
        timeout: 3000,
        success: function (response) {
            var payload = new Uint8Array(response);
            var errMsg = customer_list_protobuf_handler.verify(payload);
            if (errMsg) { displayMessage(errMsg); return; };
            var msg = customer_list_protobuf_handler.decode(payload);
            console.log(JSON.stringify(msg, null, 4));
            var customerslist_counter = 0, ce;
            console.log("customerslist.length=" + msg.customerslist.length);
            while (ce = msg.customerslist[customerslist_counter++]) {
                self.customerslist.push(new maninfo(ce.id, ce.firstName, ce.lastName, ce.email, ce.mobile, ce.dateOfBirth));
            }
            $("#submit-gridlist-protobuf-btn").prop("disabled", false);
        }
        , error: function (jqXHR, textStatus, errorThrown) {
            var err_msg = decodeAjaxErrorMessage(jqXHR, errorThrown);
            displayMessage(err_msg);
            return;
        }
        , complete: function (jqXHR, textStatus) {
            $('#overlay').fadeOut();
        }
    });
    self.addRow = function () {
        self.customerslist.push(new maninfo("", "", "", "","",""));
    };
    self.deleteRow = function (sf) {
        if (self.customerslist().length <= 1) {
            alert('at least one grid entry is required');
            return;
        }
        self.customerslist.remove(sf);
    };

    self.updateGridJSON = function () {
        $("#overlay").fadeIn();
        $.ajax({
            type: 'POST'
            , url: '/spring-protobuf/customers-protobuf'
            , data: ko.toJSON(self.customerslist)
            , contentType: "application/json; charset=UTF-8"
            , dataType: 'json'
            , timeout: 3000
            , success: function (response) {
                console.log("ss1");
                if (response.statusCode == 'error') {
                    displayMessage("Server error while updating grid:<br/>" +
                        response.statusCode);
                    return;
                }
            }
            , error: function (jqXHR, textStatus, errorThrown) {
                console.log("TextStatus="+textStatus);
                var err_msg = decodeAjaxErrorMessage(jqXHR, errorThrown);
                console.log("err_msg="+err_msg);
                displayMessage(err_msg);
            }
            , complete: function (jqXHR, textStatus) {
                $('#overlay').fadeOut();
            }
        });
    };

    self.updateGridProtoBuf = function () {
        var payload = ko.toJS(self);
        console.log("payload="+payload);
        var msg = customer_list_protobuf_handler.fromObject(payload);
        console.log("msg.customerslist.length="+msg.customerslist.length);
        var buffer = customer_list_protobuf_handler.encode(msg).finish();
        $("#overlay").fadeIn();
        $.ajax({
            type: "POST",
            dataType: 'binary',
            data: buffer ,
            responseType: 'arraybuffer',
            processData: false,
            headers:{'Content-Type':'application/x-protobuf'},
            url: '/spring-protobuf/customers-protobuf',
            timeout: 3000,
            success: function (response) {
                var payload = new Uint8Array(response);
                var errMsg = customer_list_protobuf_handler.verify(payload);
                if (errMsg) { displayMessage(errMsg); return; };
                var msg = updatemsg_protobuf_handler.decode(payload);
                console.log(JSON.stringify(msg, null, 4));
            }
            , error: function (jqXHR, textStatus, errorThrown) {
                var err_msg = decodeAjaxErrorMessage(jqXHR, errorThrown);
                displayMessage(err_msg);
            }
            , complete: function (jqXHR, textStatus) {
                $('#overlay').fadeOut();
            }
        });
    }

}

$(function () {
    vmodel = new gridViewModel();
    ko.applyBindings(vmodel);
    $('#overlay').fadeOut();

});
