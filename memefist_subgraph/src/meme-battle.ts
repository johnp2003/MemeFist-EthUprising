import {
  BattleCompleted as BattleCompletedEvent,
  BattleStarted as BattleStartedEvent,
  MemeInfoRequested as MemeInfoRequestedEvent,
  MemeSubmitted as MemeSubmittedEvent,
  MemeUpvoted as MemeUpvotedEvent,
  OwnershipTransferred as OwnershipTransferredEvent
} from "../generated/MemeBattle/MemeBattle"
import {
  BattleCompleted,
  BattleStarted,
  MemeInfoRequested,
  MemeSubmitted,
  MemeUpvoted,
  OwnershipTransferred
} from "../generated/schema"

export function handleBattleCompleted(event: BattleCompletedEvent): void {
  let entity = new BattleCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.category = event.params.category
  entity.winner = event.params.winner
  entity.winningMemeId = event.params.winningMemeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleBattleStarted(event: BattleStartedEvent): void {
  let entity = new BattleStarted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.category = event.params.category
  entity.startTime = event.params.startTime
  entity.endTime = event.params.endTime

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemeInfoRequested(event: MemeInfoRequestedEvent): void {
  let entity = new MemeInfoRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.memeId = event.params.memeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemeSubmitted(event: MemeSubmittedEvent): void {
  let entity = new MemeSubmitted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.memeId = event.params.memeId
  entity.creator = event.params.creator
  entity.category = event.params.category

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemeUpvoted(event: MemeUpvotedEvent): void {
  let entity = new MemeUpvoted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.memeId = event.params.memeId
  entity.voter = event.params.voter

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
