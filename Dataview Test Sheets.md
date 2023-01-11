```dataview
TABLE file.mday AS "Last Modified", file.cday AS "Creation Date", length(file.inlinks) AS "Inlink count"
FROM "Biology" 
SORT file.mtime ASC 
```
```dataview
TABLE file.mday AS "Last Modified", file.cday AS "Creation Date", length(file.inlinks) AS "Inlink count"
FROM "Chemistry" 
SORT file.mtime ASC
```
