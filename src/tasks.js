export default [
  { name: "Architecture", done: true, days: 60 },
  {
    name: "Nested structure",
    dependencies: ["Architecture"],
    days: 60,
    subTasks: [
      { name: "Add ability to write to DB", days: 2, done: true },
      {
        name: "Add ability to create segments",
        dependencies: ["Add ability to write to DB"],
        days: 10,
        done: true
      },
      {
        name: "Add ability to create segment structure",
        dependencies: ["Add ability to write to DB"],
        subTasks: [
          { name: "contentAccess.recordStructures", done: true },
          {
            name: "validationEngine.validateStructures",
            status: "done"
          },
          {
            name: "contentManager.recordStructure",
            status: "in-progress",
            dependencies: [
              "contentAccess.recordStructures",
              "validationEngine.validateStructures"
            ]
          }
        ],
        days: 2
      },
      {
        name: "Write new and updated channels to segments",
        dependencies: [
          "Add ability to create segments",
          "Add ability to create segment structure"
        ],
        days: 2
      },
      {
        name: "Copy current channels to segments",
        dependencies: ["Write new and updated channels to segments"],
        days: 2
      },
      {
        name: "Add ability to fetch a segment and all its children",
        dependencies: [
          "Add ability to create segments",
          "Add ability to create segment structure"
        ],
        days: 10
      },
      {
        name: "Add validation rules",
        dependencies: [
          "Add ability to create segments",
          "Add ability to create segment structure"
        ],
        days: 2
      },
      {
        name: "Show nested segments in the UI",
        dependencies: [
          "Add ability to fetch a segment and all its children",
          "Copy current channels to segments"
        ],
        days: 10
      },
      { name: "Update precommit to run tests in service layers", days: 1 }
    ]
  },
  { name: "Jusy right rail", dependencies: ["Architecture"], days: 20 },
  {
    name: "Templates",
    dependencies: ["Jusy right rail", "Nested analytics"],
    days: 30
  },
  { name: "Nested analytics", dependencies: ["Nested structure"], days: 60 },
  {
    name: "Wrapup",
    dependencies: ["Templates"],
    days: 10
  }
];
