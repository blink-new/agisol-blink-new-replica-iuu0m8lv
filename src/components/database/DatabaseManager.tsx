import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Table, 
  Plus, 
  Play, 
  Edit,
  Download,
  RefreshCw
} from 'lucide-react'
import { blink } from '@/blink/client'
import type { DatabaseTable, DatabaseColumn } from '@/types'

interface DatabaseManagerProps {
  projectId: string
}

export function DatabaseManager({ projectId }: DatabaseManagerProps) {
  const [tables, setTables] = useState<DatabaseTable[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [sqlQuery, setSqlQuery] = useState('')
  const [queryResult, setQueryResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTables = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Get all tables using SQL query
      const result = await blink.db.sql(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `)
      
      const tableList: DatabaseTable[] = []
      
      for (const row of result) {
        const tableName = row.name
        
        // Get table schema
        const schemaResult = await blink.db.sql(`PRAGMA table_info(${tableName})`)
        const columns: DatabaseColumn[] = schemaResult.map((col: any) => ({
          name: col.name,
          type: col.type,
          nullable: !col.notnull,
          primaryKey: col.pk === 1
        }))
        
        // Get row count
        const countResult = await blink.db.sql(`SELECT COUNT(*) as count FROM ${tableName}`)
        const rowCount = countResult[0]?.count || 0
        
        tableList.push({
          name: tableName,
          columns,
          rowCount
        })
      }
      
      setTables(tableList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tables')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTables()
  }, [loadTables, projectId])

  const loadTableData = async (tableName: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await blink.db.sql(`SELECT * FROM ${tableName} LIMIT 100`)
      setTableData(result)
      setSelectedTable(tableName)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load table data')
    } finally {
      setIsLoading(false)
    }
  }

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await blink.db.sql(sqlQuery)
      setQueryResult(result)
      
      // Refresh tables if query might have changed schema
      if (sqlQuery.toLowerCase().includes('create') || 
          sqlQuery.toLowerCase().includes('drop') || 
          sqlQuery.toLowerCase().includes('alter')) {
        await loadTables()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed')
    } finally {
      setIsLoading(false)
    }
  }

  const createSampleTable = async () => {
    const sampleSQL = `
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      INSERT OR IGNORE INTO todos (id, title, description, user_id) VALUES 
      ('todo_1', 'Build amazing app', 'Create a full-featured application with AGISOL', 'user_demo'),
      ('todo_2', 'Add authentication', 'Implement user login and registration', 'user_demo'),
      ('todo_3', 'Deploy to production', 'Make the app available to users', 'user_demo');
    `
    
    setSqlQuery(sampleSQL)
  }

  const selectedTableInfo = tables.find(t => t.name === selectedTable)

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Database</h3>
            <Badge variant="outline" className="text-xs">
              SQLite
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={createSampleTable}>
              <Plus className="w-3 h-3 mr-1" />
              Sample
            </Button>
            <Button size="sm" variant="outline" onClick={loadTables}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tables" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="query">SQL Query</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="flex-1 flex flex-col mt-4">
          <div className="flex flex-1">
            {/* Tables List */}
            <div className="w-64 border-r border-border">
              <div className="p-3 border-b border-border">
                <h4 className="font-medium text-sm">Tables ({tables.length})</h4>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {isLoading && tables.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Loading tables...
                    </div>
                  ) : tables.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No tables found
                    </div>
                  ) : (
                    tables.map((table) => (
                      <div
                        key={table.name}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-muted/50 ${
                          selectedTable === table.name ? 'bg-accent/20' : ''
                        }`}
                        onClick={() => loadTableData(table.name)}
                      >
                        <div className="flex items-center space-x-2">
                          <Table className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium">{table.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {table.rowCount}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Table Data */}
            <div className="flex-1 flex flex-col">
              {selectedTable ? (
                <>
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{selectedTable}</h4>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Schema */}
                  <div className="p-3 border-b border-border bg-muted/20">
                    <h5 className="font-medium text-sm mb-2">Schema</h5>
                    <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-1">
                      <span>Column</span>
                      <span>Type</span>
                      <span>Nullable</span>
                      <span>Key</span>
                    </div>
                    {selectedTableInfo?.columns.map((column) => (
                      <div key={column.name} className="grid grid-cols-4 gap-2 text-xs py-1">
                        <span className="font-medium">{column.name}</span>
                        <span className="text-accent">{column.type}</span>
                        <span>{column.nullable ? 'Yes' : 'No'}</span>
                        <span>{column.primaryKey ? 'PRIMARY' : ''}</span>
                      </div>
                    ))}
                  </div>

                  {/* Data */}
                  <ScrollArea className="flex-1">
                    <div className="p-3">
                      {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Loading data...
                        </div>
                      ) : tableData.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No data in this table
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                {Object.keys(tableData[0] || {}).map((key) => (
                                  <th key={key} className="text-left p-2 font-medium">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.map((row, index) => (
                                <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                                  {Object.values(row).map((value, cellIndex) => (
                                    <td key={cellIndex} className="p-2 max-w-xs truncate">
                                      {value === null ? (
                                        <span className="text-muted-foreground italic">null</span>
                                      ) : (
                                        String(value)
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Table className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a table to view its data</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="query" className="flex-1 flex flex-col mt-4 px-4">
          <div className="flex-1 flex flex-col space-y-4">
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">SQL Query</label>
                <Button
                  size="sm"
                  onClick={executeQuery}
                  disabled={!sqlQuery.trim() || isLoading}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Execute
                </Button>
              </div>
              <Textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
                className="flex-1 min-h-[200px] font-mono text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {queryResult && (
              <div className="flex-1 flex flex-col">
                <h5 className="font-medium text-sm mb-2">
                  Query Result ({Array.isArray(queryResult) ? queryResult.length : 0} rows)
                </h5>
                <ScrollArea className="flex-1 border border-border rounded-md">
                  <div className="p-3">
                    {Array.isArray(queryResult) && queryResult.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              {Object.keys(queryResult[0]).map((key) => (
                                <th key={key} className="text-left p-2 font-medium">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.map((row, index) => (
                              <tr key={index} className="border-b border-border/50">
                                {Object.values(row).map((value, cellIndex) => (
                                  <td key={cellIndex} className="p-2 max-w-xs truncate">
                                    {value === null ? (
                                      <span className="text-muted-foreground italic">null</span>
                                    ) : (
                                      String(value)
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        {Array.isArray(queryResult) ? 'No results' : 'Query executed successfully'}
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}