---
layout: post
title: 使用windows命令行连接neo4j
date: 2024-07-09 16:00:00 +0800
categories: 编程随笔
tags: neo4j
---

## 1. CMD命令提示符连接neo4j(bat脚本)
使用下面的脚本可以连接到neo4j数据库，并执行cypher查询，将结果保存到一个文件中。

```bat
@echo off
setlocal enabledelayedexpansion

rem Neo4j credentials and host
set NEO4J_USER=neo4j
set NEO4J_PASSWORD=neo4j_password
set NEO4J_HOST=localhost
set NEO4J_PORT=7475

rem Backend URL
set BACKEND_URL=http://localhost:8089/audit/publishAuditNodes?auditNodeIds=

rem Temp file to store result
set RESULT_FILE=cypher_result.json

rem Cypher query
set CYPHER_QUERY=MATCH (n:Person) ^
WHERE n.name CONTAINS 'test' ^
RETURN n

rem Send Cypher request
set CYPHER_REQUEST=curl -u %NEO4J_USER%:%NEO4J_PASSWORD% -H "Content-Type: application/json" -d "{\"statements\":[{\"statement\":\"!CYPHER_QUERY!\"}]}" http://%NEO4J_HOST%:%NEO4J_PORT%/db/data/transaction/commit

!CYPHER_REQUEST! > %RESULT_FILE%

```

如果需要进一步对数据处理，可能需要另外安装jq工具。注意CMD命令的`SET /p`命令有长度限制（1024个字符），如果查询结果过长，想要保存到变量中得另外处理比如使用数组（参考: [http://www.bathome.net/thread-17887-1-1.html](http://www.bathome.net/thread-17887-1-1.html)），这种情况就会比较麻烦。

## 2. 使用powershell连接neo4j
powershell 相比命令提示符更加强大，且没有上面的长度限制。可以使用下面的脚本连接neo4j。

比如我现在想从 neo4j 中读取出一些数据并传递给另一个后端服务，可以使用下面的脚本。当数据量较大时如果使用bat脚本就会出现下面的nodeIds被截断的情况，而powershell脚本则不会有这个问题。

```powershell
# Neo4j credentials and host
$NEO4J_USER = "neo4j"
$NEO4J_PASSWORD = "1qaz@WSX"
$NEO4J_HOST = "localhost"
$NEO4J_PORT = 7475

# Backend URL
$BACKEND_URL = "http://localhost:8089/audit/publish?nodeIds="

# Cypher query
$CYPHER_QUERY = @"
MATCH (n:Audit{label: 'Relationship', status: 3})
WITH n, apoc.convert.fromJsonMap(n.info) AS info
WHERE info.source = 'CBDB'
RETURN COLLECT(DISTINCT n.nodeId) AS nodeIds
"@

# Send Cypher request
$CYPHER_REQUEST = @{
    Uri = "http://${NEO4J_HOST}:${NEO4J_PORT}/db/data/transaction/commit"
    Method = "POST"
    Headers = @{
        "Content-Type" = "application/json"
    }
    Body = @{
        statements = @(@{statement = $CYPHER_QUERY})
    } | ConvertTo-Json
    Credential = [PSCredential]::new($NEO4J_USER, (ConvertTo-SecureString $NEO4J_PASSWORD -AsPlainText -Force))
}

$response = Invoke-RestMethod @CYPHER_REQUEST

# Read nodeIds from response
try {
    $nodeIds = $response.results[0].data[0].row[0] -join ','
    # Output nodeIds
    Write-Output "NodeIds: $nodeIds"
    
    # Send POST request to backend
    $BACKEND_REQUEST = @{
        Uri = "$BACKEND_URL$nodeIds"
        Method = "POST"
    }
    Invoke-RestMethod @BACKEND_REQUEST
} catch {
    Write-Output "Error parsing response: $_"
}
```
