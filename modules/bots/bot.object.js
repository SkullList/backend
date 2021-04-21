export class Bot {
  constructor ({
    _id,
    username,
    discriminator,
    avatar,
    owner,
    details
  }) {
    this._id = _id
    this.username = username
    this.discriminator = discriminator
    this.avatar = avatar
    this.owner = owner
    this.details = new BotDetails(details)
  }
}

class BotDetails {
  constructor ({
    prefix,
    library,
    summary,
    detailedDescription,
    customURL,
    anotherOwners,
    tags
  }) {
    this.prefix = prefix
    this.library = library
    this.summary = summary
    this.detailedDescription = detailedDescription
    this.customURL = customURL
    this.anotherOwners = anotherOwners
    this.tag = tags
  }
}
