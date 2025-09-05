// @ts-check
import { test, expect } from '@playwright/test';

var token;

test.beforeAll(async ({ request }) => {

    const requestBody = {
    "username" : "admin",
    "password" : "password123"
}
  
  //Requisição
  const response = await request.post('/auth', {data: requestBody });

  //Asserções
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200)

  //Atribuindo a resposta à variável token para utilização posterior
  const responseBody = await response.json();
  token = responseBody.token
})

test('Consultando todas as reservas cadastradas', async ({ request }) => {
  
  //Requisição
  const response = await request.get('/booking');

  //Asserções
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200)
})

test('Consultando uma reserva específica pelo ID', async ({ request }) => {
  
  //Obtendo um ID válido para a consulta
  const generalResponse = await request.get('/booking/')
  const generalResponseBody = await generalResponse.json()
  const id = generalResponseBody[0].bookingid
  
  //Requisição
  const response = await request.get(`/booking/${id}`);
  const responseBody = await response.json();

  //Asserções
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  expect(responseBody).toHaveProperty('firstname');
  expect(responseBody).toHaveProperty('lastname');
  expect(responseBody).toHaveProperty('totalprice');
  expect(responseBody).toHaveProperty('depositpaid');
  expect(responseBody).toHaveProperty('bookingdates.checkin');
  expect(responseBody).toHaveProperty('bookingdates.checkout');

})

test('Criando uma nova reserva', async ({ request }) => {

  const requestBody = {
    "firstname" : "Test First Name",
    "lastname" : "Test Last Name",
    "totalprice" : 777,
    "depositpaid" : true,
    "bookingdates" : {
        "checkin" : "2025-09-26",
        "checkout" : "2025-10-18"
    },
    "additionalneeds" : "Breakfast"
}

  //Requisição
  const postResponse = await request.post('/booking', {data: requestBody});

  //Asserções
  expect(postResponse.ok()).toBeTruthy();
  expect(postResponse.status()).toBe(200)
})

test('Criando uma nova reserva e validando as informações após a criação', async ({ request }) => {

  //Criação de uma nova reserva
  const requestBody = {
    "firstname" : "Test First Name",
    "lastname" : "Test Last Name",
    "totalprice" : 1305,
    "depositpaid" : false,
    "bookingdates" : {
        "checkin" : "2025-09-26",
        "checkout" : "2025-10-18"
    },
    "additionalneeds" : "Breakfast"
}

  const postResponse = await request.post('/booking', {data: requestBody});
  const postResponseBody = await postResponse.json();
  const idCriado = postResponseBody.bookingid;

  expect(postResponse.ok()).toBeTruthy();
  expect(postResponse.status()).toBe(200)

  //Validando que as informações obtidas da reserva estão conforme as informações enviadas no momento da criação
  const getResponse = await request.get(`/booking/${idCriado}`);
  const getResponseBody = await getResponse.json();

  expect(getResponseBody.firstname).toBe(requestBody.firstname);
  expect(getResponseBody.lastname).toBe(requestBody.lastname);
  expect(getResponseBody.totalprice).toBe(requestBody.totalprice);
  expect(getResponseBody.depositpaid).toBe(requestBody.depositpaid);
  expect(getResponseBody.bookingdatescheckin).toBe(requestBody.bookingdatescheckin);
  expect(getResponseBody.bookingdatescheckout).toBe(requestBody.bookingdatescheckout);
  expect(getResponseBody.additionalneeds).toBe(requestBody.additionalneeds);
})

test('Tentando criar uma nova reserva sem informar uma propriedade no request body', async ({ request }) => {

  const requestBody = {
    "firstname" : "Test First Name",
    "lastname" : "Test Last Name",
    "totalprice" : 777,
    //"depositpaid" : true,
    "bookingdates" : {
        "checkin" : "2025-09-26",
        "checkout" : "2025-10-18"
    },
    "additionalneeds" : "Breakfast"
}

  //Requisição
  const postResponse = await request.post('/booking', {data: requestBody});

  //Asserções
  expect(postResponse.ok()).toBeFalsy();
  expect(postResponse.status()).toBe(500)
})

test('Alterando uma reserva de forma completa e validando as informações após a alteração', async ({ request }) => {

  //Criação de uma nova reserva
  const requestBodyPost = {
    "firstname" : "Test First Name Before",
    "lastname" : "Test Last Name Before",
    "totalprice" : 2603,
    "depositpaid" : false,
    "bookingdates" : {
        "checkin" : "2025-09-26",
        "checkout" : "2025-10-18"
    },
    "additionalneeds" : "Breakfast"
}

  const postResponse = await request.post('/booking', {data: requestBodyPost});
  const postResponseBody = await postResponse.json();
  const idCriado = postResponseBody.bookingid;

  expect(postResponse.ok()).toBeTruthy();
  expect(postResponse.status()).toBe(200)

  //Alteração da reserva criada
  const requestBodyPut = {
    "firstname" : "Test First Name After",
    "lastname" : "Test Last Name After",
    "totalprice" : 2607,
    "depositpaid" : true,
    "bookingdates" : {
        "checkin" : "2025-09-27",
        "checkout" : "2025-10-19"
    },
    "additionalneeds" : "Breakfast"
}

  const putResponse = await request.patch(`/booking/${idCriado}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': `token=${token}`
    },
    data: {
      requestBodyPut
    }, 
  });

  const putResponseBody = await putResponse.json();

  expect(putResponse.ok()).toBeTruthy();
  expect(putResponse.status()).toBe(200)

  //Validando que as informações obtidas da reserva estão conforme as informações enviadas na alteração
  const getResponse = await request.get(`/booking/${idCriado}`);
  const getResponseBody = await getResponse.json();

  expect(getResponseBody.firstname).toBe(putResponseBody.firstname);
  expect(getResponseBody.lastname).toBe(putResponseBody.lastname);
  expect(getResponseBody.totalprice).toBe(putResponseBody.totalprice);
  expect(getResponseBody.depositpaid).toBe(putResponseBody.depositpaid);
  expect(getResponseBody.bookingdatescheckin).toBe(putResponseBody.bookingdatescheckin);
  expect(getResponseBody.bookingdatescheckout).toBe(putResponseBody.bookingdatescheckout);
  expect(getResponseBody.additionalneeds).toBe(putResponseBody.additionalneeds);
})

test('Alterando uma reserva de forma parcial e validando as informações após a alteração', async ({ request }) => {

  //Criação de uma nova reserva
  const requestBodyPost = {
    "firstname" : "Test First Name Before",
    "lastname" : "Test Last Name Before",
    "totalprice" : 2603,
    "depositpaid" : false,
    "bookingdates" : {
        "checkin" : "2025-09-26",
        "checkout" : "2025-10-18"
    },
    "additionalneeds" : "Breakfast"
}

  const postResponse = await request.post('/booking', {data: requestBodyPost});
  const postResponseBody = await postResponse.json();
  const idCriado = postResponseBody.bookingid;

  expect(postResponse.ok()).toBeTruthy();
  expect(postResponse.status()).toBe(200)

  //Alteração da reserva criada
  const requestBodyPatch = {
    "firstname" : "Test First Name After",
    "lastname" : "Test Last Name After",
}

  const patchResponse = await request.patch(`/booking/${idCriado}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': `token=${token}`
    },
    data: {
      requestBodyPatch
    }, 
  });

  const patchResponseBody = await patchResponse.json();

  expect(patchResponse.ok()).toBeTruthy();
  expect(patchResponse.status()).toBe(200)

  //Validando que as informações obtidas da reserva estão conforme as informações enviadas na requisição
  const getResponse = await request.get(`/booking/${idCriado}`);
  const getResponseBody = await getResponse.json();

  expect(getResponseBody.firstname).toBe(patchResponseBody.firstname);
  expect(getResponseBody.lastname).toBe(patchResponseBody.lastname);
  expect(getResponseBody.totalprice).toBe(patchResponseBody.totalprice);
  expect(getResponseBody.depositpaid).toBe(patchResponseBody.depositpaid);
  expect(getResponseBody.bookingdatescheckin).toBe(patchResponseBody.bookingdatescheckin);
  expect(getResponseBody.bookingdatescheckout).toBe(patchResponseBody.bookingdatescheckout);
  expect(getResponseBody.additionalneeds).toBe(patchResponseBody.additionalneeds);
})

test('Excluindo uma reserva', async ({ request }) => {

  //Criação de uma nova reserva
  const requestBodyPost = {
    "firstname" : "Test First Name Before",
    "lastname" : "Test Last Name Before",
    "totalprice" : 2603,
    "depositpaid" : false,
    "bookingdates" : {
        "checkin" : "2025-09-26",
        "checkout" : "2025-10-18"
    },
    "additionalneeds" : "Breakfast"
}

  const postResponse = await request.post('/booking', {data: requestBodyPost});
  const postResponseBody = await postResponse.json();
  const idCriado = postResponseBody.bookingid;

  expect(postResponse.ok()).toBeTruthy();
  expect(postResponse.status()).toBe(200)

  //Exclusão da reserva criada
 
  const deleteResponse = await request.delete(`/booking/${idCriado}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': `token=${token}`
    }
  });

  expect(deleteResponse.ok()).toBeTruthy();
  expect(deleteResponse.status()).toBe(201)

  //Validando que a reserva foi de fato excluída
  const getResponse = await request.get(`/booking/${idCriado}`);

  expect(getResponse.status()).toBe(404);

})

test('Tentando excluir uma reserva sem estar autorizado', async ({ request }) => {

  //Criação de uma nova reserva
  const requestBodyPost = {
    "firstname" : "Test First Name Before",
    "lastname" : "Test Last Name Before",
    "totalprice" : 2603,
    "depositpaid" : false,
    "bookingdates" : {
        "checkin" : "2025-09-26",
        "checkout" : "2025-10-18"
    },
    "additionalneeds" : "Breakfast"
}

  const postResponse = await request.post('/booking', {data: requestBodyPost});
  const postResponseBody = await postResponse.json();
  const idCriado = postResponseBody.bookingid;

  expect(postResponse.ok()).toBeTruthy();
  expect(postResponse.status()).toBe(200)

  //Tentativa de exclusão da reserva criada sem informar o token
 
  const deleteResponse = await request.delete(`/booking/${idCriado}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  expect(deleteResponse.ok()).toBeFalsy();
  expect(deleteResponse.status()).toBe(403)

})

