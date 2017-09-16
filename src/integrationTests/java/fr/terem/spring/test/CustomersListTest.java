package fr.terem.spring.test;

import fr.terem.protobuf.CustomerProtos;
import com.googlecode.protobuf.format.JsonFormat;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.junit.Test;
import org.junit.Before;

import java.io.IOException;
import java.io.InputStream;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertThat;

public class CustomersListTest {

    private String TEST_BASE_URL = null;

    @Before
    public void init() {	
	TEST_BASE_URL = System.getProperty("gretty.httpBaseURI");
    }

    @Test
    public void whenUsingHttpClient_thenSucceed() throws IOException {
        InputStream responseStream = executeHttpRequest(TEST_BASE_URL+"/customers-protobuf");
        String jsonOutput = convertProtobufMessageStreamToJsonString(responseStream);
        assertResponse(jsonOutput);
    }

    private InputStream executeHttpRequest(String url) throws IOException {
        CloseableHttpClient httpClient = HttpClients.createDefault();
        HttpGet request = new HttpGet(url);
        HttpResponse httpResponse = httpClient.execute(request);
        return httpResponse.getEntity().getContent();
    }

    private String convertProtobufMessageStreamToJsonString(InputStream protobufStream) throws IOException {
        JsonFormat jsonFormat = new JsonFormat();
        CustomerProtos.Customers customers = CustomerProtos.Customers.parseFrom(protobufStream);
	String out = jsonFormat.printToString(customers);
	System.out.println(new GsonBuilder().setPrettyPrinting().create().toJson(new JsonParser().parse(out)));
        return out;
    }

    private void assertResponse(String response) {
        assertThat(response, containsString("id"));
    }
}