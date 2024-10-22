import { Table } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TableColumnsType } from "antd";
import "./index.less";
import { getUUID } from "./help";
import { filter } from "lodash-es";
export interface DataType {
  key: string;
  name: React.ReactNode;
  type?: string;
  description?: string;
  children?: DataType[];
  level?: number;
}

function removeElementByKey(data, targetKey) {
  return filter(data, function (item) {
    // Remove the element if its key matches the target key
    if (item.key === targetKey) {
      return false;
    }

    // Recursively process child elements if they exist
    if (item.children && item.children.length > 0) {
      item.children = removeElementByKey(item.children, targetKey);
    }
    // Keep other elements
    return true;
  });
}
function findElementLevel(data, targetKey, currentLevel = 1) {
  for (const item of data) {
    if (item.key === targetKey) {
      return currentLevel; // Return the current level if the target element is found
    }
    if (item.children && item.children.length > 0) {
      const level = findElementLevel(
        item.children,
        targetKey,
        currentLevel + 1
      );
      if (level !== null) {
        return level; // Return the level of the target element if found
      }
    }
  }
  return null; // Return null if the target element is not found in the current branch
}

function countExpandedElements(data, targetKey, expandedRowKeys) {
  let count = 0;
  const expandedNodes = [];

  function traverse(node, isParentExpanded, isLastChild) {
    // Check if the current node is the target node or if its parent is expanded
    if (node.key === targetKey || isParentExpanded) {
      // If the node is in expandedRowKeys and has children
      if (
        expandedRowKeys.includes(node.key) &&
        node.children &&
        node.children.length > 0
      ) {
        node.children.forEach((child, index) => {
          const isLast = index === node.children.length - 1;
          if (node.key === targetKey && isLast) {
            count++; // Count the last child as one regardless of its expansion
            expandedNodes.push(child); // Add the last child node to the list
          }
          // if (isLast) {
          //   count++; // Count the last child as one regardless of its expansion
          //   expandedNodes.push(child); // Add the last child node to the list
          // }
          else {
            count++; // Count the child node
            expandedNodes.push(child); // Add the node to the list
            traverse(child, true, isLast); // Recursively check child nodes
          }
        });
      }
      return true; // Target node found
    }

    // Recursively traverse child nodes
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (traverse(child, false, false)) {
          return true; // Stop traversing if the target node is found in child nodes
        }
      }
    }

    return false;
  }

  // Start traversal from each root node
  for (const node of data) {
    traverse(node, false, false);
  }
  console.log("expandedNodes===", expandedNodes);

  return { count, expandedNodes: expandedNodes.map((node) => node.key) };
}

function calculateTotalHeight(keys, path: string, currentKey: string) {
  let totalHeight = 0;
  let currentRowHeight = 0;
  console.log("keys====", keys, "\ncurrentKey", currentKey);

  const currentRow = document.querySelector(`${path}-${currentKey}`);
  if (currentRow) {
    currentRowHeight = currentRow.offsetHeight;
  }
  keys.forEach((key, index) => {
    // Use querySelector to find the element by ID
    const element = document.querySelector(`${path}-${key}`);
    if (element) {
      // Get the element's height including padding, but excluding margin and border
      const style = window.getComputedStyle(element);
      const elementHeight = element.offsetHeight;
      const paddingTop = parseFloat(style.paddingTop);
      const paddingBottom = parseFloat(style.paddingBottom);
      // Calculate the total height as the element's offsetHeight
      // Alternatively, you can calculate it manually:
      // const totalElementHeight = elementHeight - paddingTop - paddingBottom;

      totalHeight +=
        index === keys.length - 1 ? elementHeight / 2 : elementHeight;
    }
  });

  return totalHeight + currentRowHeight / 2;
}
interface FunctionOutputProps {
  sourceData?: DataType[];
  showHeader?: boolean;
  sourceColumns?: TableColumnsType<DataType>;
  expandedIcon?:React.ReactNode;
  unExpandedIcon?:React.ReactNode;
  vaticalGap?: number; //Used to compensate for vertical line length
}
export default function TreeTable({
  sourceData = [
    {
      key: "1",
      name: "John Brown sr.John Brown sr.John Brown sr.",
      type: "Object",
      description: "New York No. 1 Lake Park",
      children: [
        {
          key: "2",
          name: "John Brown sr.John Brown sr.John Brown sr.",
          type: "Object",
          description: "New York No. 1 ",
          children: [
            {
              key: "3",
              name: "John Brown sr.John Brown sr.John Brown sr.",
              type: "Object",
              description: "New York No. 1 ",
              children: [],
            },
          ],
        },
      ],
      level: 1,
    },
  ],
  showHeader = true,
  sourceColumns = [
    {
      title: "Output name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Data type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "description",
    },
    {
      title: "",
      dataIndex: "actions",
      width: 30,
      key: "actions",
    },
  ],
  vaticalGap = 4,
  expandedIcon,
  unExpandedIcon
}: FunctionOutputProps) {
  const tableIdRef = useRef("table" + getUUID(4));
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  let columns: TableColumnsType<DataType> = sourceColumns || [];
  const [data, setData] = useState(sourceData);
  useEffect(() => {
    const allExpandKeys =
      data.filter((d) => d.children?.length)?.map((d) => d.key) || [];
    setExpandedRowKeys(allExpandKeys as any);
    setTimeout(() => {
      setExpandedRowKeys([...allExpandKeys]);
    }, 100);
  }, []);

  const expandable = useMemo(() => {
    return {
      expandIcon: ({ expanded, onExpand, record }) => {
        if (!record.children?.length)
          return (
            <div
              className={`w-4  inline  relative self-stretch  ${
                record.level ? "is-level-0" : "function-table-expand-empty"
              }`}
            ></div>
          );
        return expanded ? (
          <div
            className="function-table-expand-down relative mr-2 flex items-center"
            onClick={(e) => onExpand(record, e)}
          >
            <div className="inline-block w-2 h-2 relative z-60 " >
              {expandedIcon}
            </div>
            {/* vertical line */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute border-l border-dashed z-50 top-[16px] left-1/2 transform -translate-x-1/2"
              style={{
                height:
                  calculateTotalHeight(
                    countExpandedElements(data, record.key, expandedRowKeys)
                      .expandedNodes,
                    `#${tableIdRef.current} .output-table-row`,
                    record.key
                  ) - vaticalGap,
              }}
            ></div>
            {/* left line */}
            {!record.level && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute border-t border-dashed z-50 right-0.5 top-1/2 transform -translate-y-1/2"
                style={{ width: 14 }}
              ></div>
            )}
          </div>
        ) : (
          <div
            className="function-table-expand-up relative mr-2"
            onClick={(e) => onExpand(record, e)}
          >
            <div className="-rotate-90 transform inline-block w-2 h-2 relative z-60" >
              {unExpandedIcon}
            </div>
            {!record.level && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute border-t border-dashed z-50 right-0 top-1/2 transform -translate-y-1/2"
                style={{ width: 20 }}
              ></div>
            )}
          </div>
        );
      },
      defaultExpandAllRows: true,
      expandedRowKeys: expandedRowKeys,
      onExpandedRowsChange: (values) => {
        setExpandedRowKeys(values as any);
        setTimeout(() => {
          setExpandedRowKeys([...values]);
        }, 100);
      },
    };
  }, [expandedRowKeys, data]);
  return (
    <Table<DataType>
      id={tableIdRef.current}
      showHeader={showHeader}
      pagination={false}
      rowClassName={(record) => {
        return `output-table-row-${record.key}`;
      }}
      className="output-table"
      columns={columns}
      dataSource={data}
      bordered={false}
      expandable={expandable}
    />
  );
}
