local h = ngx.req.get_headers()
local request_headers_all = ""
for k, v in pairs(h) do
    request_headers_all = request_headers_all .. ""..k.."="..v.."; "
end
return request_headers_all
