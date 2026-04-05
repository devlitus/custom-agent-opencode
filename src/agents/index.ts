export { orchestrator } from "./orchestrator.js";
export { investigator } from "./investigator.js";
export { planner } from "./planner.js";
export { builder } from "./builder.js";
export { qa } from "./qa.js";
export { security } from "./security.js";
export { docsWriter } from "./docs-writer.js";

import { orchestrator } from "./orchestrator.js";
import { investigator } from "./investigator.js";
import { planner } from "./planner.js";
import { builder } from "./builder.js";
import { qa } from "./qa.js";
import { security } from "./security.js";
import { docsWriter } from "./docs-writer.js";
import type { AgentDefinition } from "../types.js";

export const ALL_AGENTS: AgentDefinition[] = [
  orchestrator,
  investigator,
  planner,
  builder,
  qa,
  security,
  docsWriter,
];
