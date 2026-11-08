export default{
  async fetch(request, env){
    const url = new URL(request.url);

    if(url.pathname === "/api/products"){
      const params = url.searchParams.get("category");
      
      const {results} = await env.DB
        .prepare("SELECT * FROM product WHERE category = ?")
        .bind(params)
        .all();

      const products = (row) =>{
        const {specs, ...rest} = row;
        return {...rest, ...JSON.parse(specs || "{}")};
      }

        return Response.json(results);
    }

    return new Response("Not found", {status : 404});
  }
}