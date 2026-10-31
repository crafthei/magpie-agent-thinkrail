import test from "node:test"
import assert from "node:assert/strict"

import { agent, connect } from "../thinkrail.agent.js"

test("descriptor", () => {
  assert.equal(agent.id, "thinkrail")
  assert.equal(agent.config, "~/.pi/agent/models.json")
  assert.equal(agent.format, "json")
  assert.ok(agent.dir.startsWith("~/"))
  assert.ok(typeof agent.notice === "string" && agent.notice.length > 0)
})

test("connect writes the whole magpie provider as one unit", () => {
  const out = connect({
    gateway: { v1: "http://127.0.0.1:3425/v1", key: "magpie-thinkrail" },
    models: [
      { id: "deepseek/deepseek-chat", name: "DeepSeek Chat", images: false, context: 128000, output: 8192, efforts: [] },
    ],
  })

  assert.deepEqual(Object.keys(out), ["providers.magpie"])
  const p = out["providers.magpie"]
  assert.equal(p.name, "Magpie")
  assert.equal(p.baseUrl, "http://127.0.0.1:3425/v1")
  assert.equal(p.apiKey, "magpie-thinkrail")
  assert.equal(p.api, "openai-completions")
  assert.equal(p.models.length, 1)

  const m = p.models[0]
  assert.equal(m.id, "deepseek/deepseek-chat")
  assert.deepEqual(m.input, ["text"])
  assert.equal(m.reasoning, false)
  assert.equal(m.contextWindow, 128000)
  assert.equal(m.maxTokens, 8192)
  assert.equal(m.thinkingLevelMap, undefined)
})

test("output limit never exceeds the context window", () => {
  const out = connect({
    gateway: { v1: "http://127.0.0.1:3425/v1", key: "k" },
    models: [{ id: "x/y", name: "X", images: false, context: 32000, output: 999999, efforts: ["low", "high"] }],
  })
  const m = out["providers.magpie"].models[0]
  assert.equal(m.maxTokens, 32000)
  assert.equal(m.reasoning, true)
  // pig semantics: a level maps to the pi effort name when the model
  // publishes it, otherwise null ("off" asks for the "none" effort).
  assert.equal(m.thinkingLevelMap.off, null)
  assert.equal(m.thinkingLevelMap.low, "low")
  assert.equal(m.thinkingLevelMap.high, "high")
  assert.equal(m.thinkingLevelMap.minimal, null)
})

test("image-capable model advertises image input", () => {
  const out = connect({
    gateway: { v1: "http://127.0.0.1:3425/v1", key: "k" },
    models: [{ id: "x/img", name: "X", images: true, context: 0, output: 0, efforts: [] }],
  })
  const m = out["providers.magpie"].models[0]
  assert.deepEqual(m.input, ["text", "image"])
  assert.equal(m.contextWindow, undefined)
  assert.equal(m.maxTokens, undefined)
})
