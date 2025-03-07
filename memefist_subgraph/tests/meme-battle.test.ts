import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { BattleCompleted } from "../generated/schema"
import { BattleCompleted as BattleCompletedEvent } from "../generated/MemeBattle/MemeBattle"
import { handleBattleCompleted } from "../src/meme-battle"
import { createBattleCompletedEvent } from "./meme-battle-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let category = "Example string value"
    let winner = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let winningMemeId = BigInt.fromI32(234)
    let newBattleCompletedEvent = createBattleCompletedEvent(
      category,
      winner,
      winningMemeId
    )
    handleBattleCompleted(newBattleCompletedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("BattleCompleted created and stored", () => {
    assert.entityCount("BattleCompleted", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "BattleCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "category",
      "Example string value"
    )
    assert.fieldEquals(
      "BattleCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "winner",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "BattleCompleted",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "winningMemeId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
