import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  BattleCompleted,
  BattleStarted,
  MemeInfoRequested,
  MemeSubmitted,
  MemeUpvoted,
  OwnershipTransferred
} from "../generated/MemeBattle/MemeBattle"

export function createBattleCompletedEvent(
  category: string,
  winner: Address,
  winningMemeId: BigInt
): BattleCompleted {
  let battleCompletedEvent = changetype<BattleCompleted>(newMockEvent())

  battleCompletedEvent.parameters = new Array()

  battleCompletedEvent.parameters.push(
    new ethereum.EventParam("category", ethereum.Value.fromString(category))
  )
  battleCompletedEvent.parameters.push(
    new ethereum.EventParam("winner", ethereum.Value.fromAddress(winner))
  )
  battleCompletedEvent.parameters.push(
    new ethereum.EventParam(
      "winningMemeId",
      ethereum.Value.fromUnsignedBigInt(winningMemeId)
    )
  )

  return battleCompletedEvent
}

export function createBattleStartedEvent(
  category: string,
  startTime: BigInt,
  endTime: BigInt
): BattleStarted {
  let battleStartedEvent = changetype<BattleStarted>(newMockEvent())

  battleStartedEvent.parameters = new Array()

  battleStartedEvent.parameters.push(
    new ethereum.EventParam("category", ethereum.Value.fromString(category))
  )
  battleStartedEvent.parameters.push(
    new ethereum.EventParam(
      "startTime",
      ethereum.Value.fromUnsignedBigInt(startTime)
    )
  )
  battleStartedEvent.parameters.push(
    new ethereum.EventParam(
      "endTime",
      ethereum.Value.fromUnsignedBigInt(endTime)
    )
  )

  return battleStartedEvent
}

export function createMemeInfoRequestedEvent(
  memeId: BigInt
): MemeInfoRequested {
  let memeInfoRequestedEvent = changetype<MemeInfoRequested>(newMockEvent())

  memeInfoRequestedEvent.parameters = new Array()

  memeInfoRequestedEvent.parameters.push(
    new ethereum.EventParam("memeId", ethereum.Value.fromUnsignedBigInt(memeId))
  )

  return memeInfoRequestedEvent
}

export function createMemeSubmittedEvent(
  memeId: BigInt,
  creator: Address,
  category: string
): MemeSubmitted {
  let memeSubmittedEvent = changetype<MemeSubmitted>(newMockEvent())

  memeSubmittedEvent.parameters = new Array()

  memeSubmittedEvent.parameters.push(
    new ethereum.EventParam("memeId", ethereum.Value.fromUnsignedBigInt(memeId))
  )
  memeSubmittedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  memeSubmittedEvent.parameters.push(
    new ethereum.EventParam("category", ethereum.Value.fromString(category))
  )

  return memeSubmittedEvent
}

export function createMemeUpvotedEvent(
  memeId: BigInt,
  voter: Address
): MemeUpvoted {
  let memeUpvotedEvent = changetype<MemeUpvoted>(newMockEvent())

  memeUpvotedEvent.parameters = new Array()

  memeUpvotedEvent.parameters.push(
    new ethereum.EventParam("memeId", ethereum.Value.fromUnsignedBigInt(memeId))
  )
  memeUpvotedEvent.parameters.push(
    new ethereum.EventParam("voter", ethereum.Value.fromAddress(voter))
  )

  return memeUpvotedEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}
