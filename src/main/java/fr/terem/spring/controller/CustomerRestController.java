package fr.terem.spring.controller;

import fr.terem.protobuf.CustomerProtos;
import fr.terem.spring.dao.CustomerDAO;
import fr.terem.spring.model.Customer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;

@RestController
public class CustomerRestController {

	private static final Logger logger = LoggerFactory.getLogger(CustomerRestController.class);
	private SimpleDateFormat dformatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ");

	@Autowired
	private CustomerDAO customerDAO;

	@GetMapping("/customers")
	public List getCustomers() {
		return customerDAO.list();
	}

	@PostMapping(value = "/customers")
	public ResponseEntity postCustomersListJSON(@RequestBody List<Customer> clist) {
	    logger.info("postCustomersListJSON()");
        customerDAO.list().clear();
        customerDAO.list().addAll(clist);

		return new ResponseEntity("{\"statusCode\": \"success\"}", HttpStatus.OK);
	}

	// Google ProfoBuf additional stuff

	private Customer convertCustomerProto2JSON(CustomerProtos.Customer in) {
		if (in == null) return null;
		Customer repo_customer = new Customer(
				Long.parseLong(in.getId()),in.getFirstName(),in.getLastName(),in.getEmail(),in.getMobile()
		);
		try {
			repo_customer.setDateOfBirth(dformatter.parse(in.getDateOfBirth()));
		} catch (ParseException e) {
			logger.error("Wrong date field entered, using default new Date() instead (as a failsafe countermeasure, for testing purposes only) : "+in.getDateOfBirth());
		}
		return repo_customer;
	}

	private CustomerProtos.Customer convertCustomerJSON2Proto(Customer in) {
		if (in == null) return null;
		CustomerProtos.Customer proto_customer = CustomerProtos.Customer.newBuilder()
				.setId(in.getId().toString())
				.setFirstName(in.getFirstName())
				.setLastName(in.getLastName())
				.setEmail(in.getLastName())
				.setMobile(in.getMobile())
				.setDateOfBirth(dformatter.format(in.getDateOfBirth())).build();
		return proto_customer;
	}


	@GetMapping(value = "/customers-protobuf", produces = "application/x-protobuf")
	public CustomerProtos.Customers getCustomersListProtobuf() {
		logger.info("getCustomersListProtobuf()");
		CustomerProtos.Customers.Builder proto_cust_list_builder  = CustomerProtos.Customers.newBuilder();
		for (Customer cust_entry : customerDAO.list()) {
			proto_cust_list_builder.addCustomerslist(convertCustomerJSON2Proto(cust_entry));
		}
		return proto_cust_list_builder.build();
	}

	@PostMapping(value = "/customers-protobuf", produces = "application/x-protobuf")
	public CustomerProtos.UpdateStatus postCustomersListProtobuf(@RequestBody CustomerProtos.Customers in) {
        logger.debug("postCustomersListProtobuf()");
		customerDAO.list().clear();

		CustomerProtos.Customers.Builder proto_cust_list_builder  = CustomerProtos.Customers.newBuilder();
		for (CustomerProtos.Customer cust_entry : in.getCustomerslistList()) {
            customerDAO.list().add(convertCustomerProto2JSON(cust_entry));
		}
        CustomerProtos.UpdateStatus.Builder proto_updatemsg_builder  = CustomerProtos.UpdateStatus.newBuilder();
        proto_updatemsg_builder.setStatusCode("success");
        logger.debug(" customerDAO.list() new size = "+customerDAO.list().size());
		return proto_updatemsg_builder.build();
	}

}