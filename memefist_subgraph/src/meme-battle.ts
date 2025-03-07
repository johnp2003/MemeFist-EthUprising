import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  BattleCompleted as BattleCompletedEvent,
  MemeInfoRequested as MemeInfoRequestedEvent,
  BattleStarted as BattleStartedEvent,
  MemeSubmitted as MemeSubmittedEvent,
  MemeUpvoted as MemeUpvotedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  MemeBattle
} from "../generated/MemeBattle/MemeBattle"
import {
  BattleCompleted,
  BattleStarted,
  MemeInfoRequested,
  MemeSubmitted,
  MemeUpvoteCount,
  MemeUpvoted,
  OwnershipTransferred,
  WinnerMemeDetails,
  // Voter
} from "../generated/schema"

export function handleBattleCompleted(event: BattleCompletedEvent): void {
  // Create or update the BattleCompleted entity
  let battleCompleted = new BattleCompleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  battleCompleted.category = event.params.category;
  battleCompleted.winner = event.params.winner;
  battleCompleted.winningMemeId = event.params.winningMemeId;
  battleCompleted.blockNumber = event.block.number;
  battleCompleted.blockTimestamp = event.block.timestamp;
  battleCompleted.transactionHash = event.transaction.hash;
  battleCompleted.save();

  // Update the MemeUpvoteCount entity for the winningMemeId
  let memeUpvoteCount = MemeUpvoteCount.load(event.params.winningMemeId.toString());
  if (memeUpvoteCount) {
    memeUpvoteCount.battleCompleted = battleCompleted.id;
    memeUpvoteCount.winner = battleCompleted.winner; // Derive winner
    memeUpvoteCount.category = battleCompleted.category; // Derive category
    memeUpvoteCount.save();
  }
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
  // Create or update the MemeUpvoted entity
  let entity = new MemeUpvoted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.memeId = event.params.memeId;
  entity.voter = event.params.voter;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();

  // Update the MemeUpvoteCount entity
  let memeUpvoteCount = MemeUpvoteCount.load(event.params.memeId.toString());
  if (!memeUpvoteCount) {
    memeUpvoteCount = new MemeUpvoteCount(event.params.memeId.toString());
    memeUpvoteCount.memeId = event.params.memeId;
    memeUpvoteCount.upvoteAmount = BigInt.fromI32(0);
    // Default values for winner and category (to be updated by BattleCompleted handler)
    memeUpvoteCount.winner = new Bytes(0);
    memeUpvoteCount.category = "";
  }
  memeUpvoteCount.upvoteAmount = memeUpvoteCount.upvoteAmount.plus(BigInt.fromI32(1));
  memeUpvoteCount.save();
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
