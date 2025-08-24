import React from 'react'
import './Playlist.css'
import TrackList from '../TrackList/TrackList.jsx'

export default class Playlist extends React.Component {
  constructor(props) {
    super(props)
    this.handleNameChange = this.handleNameChange.bind(this)
  }

  handleNameChange(e) {
    if (this.props.onNameChange) {
      this.props.onNameChange(e.target.value)
    }
  }

  render() {
    return (
      <div className="Playlist">
  <label htmlFor="playlist-name" className="sr-only">Playlist name</label>
  <input id="playlist-name" name="playlist-name" defaultValue={'New Playlist'} placeholder="New Playlist" aria-label="Playlist name" onChange={this.handleNameChange} />
        <TrackList tracks={this.props.playlistTracks || []} onRemove={this.props.onRemove} isRemoval={true} />
        <button className="Playlist-save" onClick={this.props.onSave} disabled={this.props.isSaving}>
          {this.props.isSaving ? 'SAVING…' : 'SAVE TO SPOTIFY'}
        </button>
      </div>
    )
  }
}
