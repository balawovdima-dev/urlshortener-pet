def test_healthz(client):
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_readyz(client):
    assert client.get("/readyz").status_code == 200


def test_create_and_follow(client):
    r = client.post("/api/links", json={"url": "https://example.com/some/page"})
    assert r.status_code == 201
    body = r.json()
    assert len(body["code"]) == 7
    assert body["short_url"].endswith("/" + body["code"])

    redirect = client.get(f"/{body['code']}", follow_redirects=False)
    assert redirect.status_code == 307
    assert redirect.headers["location"] == "https://example.com/some/page"

    stats = client.get(f"/api/links/{body['code']}").json()
    assert stats["clicks"] == 1


def test_custom_alias(client):
    r = client.post("/api/links", json={"url": "https://example.com", "alias": "my-link"})
    assert r.status_code == 201
    assert r.json()["code"] == "my-link"

    dup = client.post("/api/links", json={"url": "https://other.com", "alias": "my-link"})
    assert dup.status_code == 409


def test_reserved_alias(client):
    r = client.post("/api/links", json={"url": "https://example.com", "alias": "metrics"})
    assert r.status_code == 422


def test_invalid_url(client):
    r = client.post("/api/links", json={"url": "not a url"})
    assert r.status_code == 422


def test_unknown_code(client):
    assert client.get("/nope123", follow_redirects=False).status_code == 404
    assert client.get("/api/links/nope123").status_code == 404


def test_metrics(client):
    client.post("/api/links", json={"url": "https://example.com"})
    r = client.get("/metrics")
    assert r.status_code == 200
    assert "shortener_links_created_total" in r.text
