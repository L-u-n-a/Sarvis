# Sarvis

Sarvis is a simple, small api that helps organise and execute your HTTP requests with excellent Typescript support. build on top of the browser native fetch api.

## Using Sarvis

To create a new instance of Sarvis:
```ts
const sarvis = new Sarvis();
```

It's possible to pass a base configuration to Sarvis:

```ts
const sarvis = new Sarvis({
    // The url that will be used in every request.
    base_url: "https://www.your-domain.com",
    // (Optional) The port number that will be used for a request.
    port: 3000,
    // (Optional) Most api's have a base path, such as: /api, or /v1 etc.
    base_path: "/api",
    // (Optional) A string that will be set to the Authorazation header on every request, for example:
    // "Bearer YOUR_BEARER_TOKEN_HERE".
    authorization: "Bearer a_token_here"
});
```

### Requests

#### GET

Let's say we're fetching a TODO item that looks like this:

```json
{
  "id": 1,
  "todo": "Clean Kitchen" 
}
```

And we have an Interface declared for this dto:

```ts
interface TodoDto {
    id: number;
    todo: string;
}
```

Let's perform a GET request for that Todo:

```ts
const result = await sarvis.get<TodoDto>("https://www.your-domain.com/api/1");
```

Your result object is now of type TodoDto.

If you have added a config with base_url, you only need to add the part that comes after:

```ts
const result = await sarvis.get("/1");
```

### POST, PUT, DELETE

For all other requests, add a body after the URL:

```ts
const postResult = sarvis.post<TodoDto>("/1", body);

const putResult = sarvis.put<TodoDto>("/1", body);

// The body for a DELETE request is optional.
const deleteResult = sarvis.post<boolean>("/1", body);
```

### Custom Configuration

You won't of course, always want to use the standard request configuration.
It's possible to add a custom configuration to every request:

```ts
const customConfig: RequestInit = {
    method: "POST",
}
const result = await sarvis.get("/1", customConfig);
```

### useBefore and useAfter

Sometimes you want to execute an operation before, or after evey request.<br />
Sarvis offers an easy way to do so:

```ts
// Executed before every request.
sarvis.useBefore = (url: string, config: RequestInit) => {
    url = url + "/todos";
    config.headers.append("Content-Type", "blob");
    
    return { url, config };
};

// Executed after every request, before the result is converted to JSON
sarvis.useAfter = (result: any) => {
    result["newValue"] = "Some Test value for demo purposes.";

    return result;
};
```

