import { getProject } from "./data";

async function fixData() {
  const projectRef = await getProject("curation");
  projectRef.onSnapshot((p) => {
    const proj = p.data();
    // console.log(JSON.stringify(proj, null, 2));
    const fixed = { ...proj, tasks: proj.tasks.filter((t) => !!t.id) };
    console.log(JSON.stringify(fixed, null, 2));

    projectRef.update(fixed);
  });
}

fixData().catch((err) => {
  console.error(err);
});
