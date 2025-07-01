const URL_BASE = "http://127.0.0.1:5000/";

export async function getResult(params) {
  const response = await fetch(URL_BASE + 'product/get-result-filtered', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(data)
  return data;
}

