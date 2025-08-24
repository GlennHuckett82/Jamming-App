import React from 'react'
import './App.css'
import SearchBar from '../SearchBar/SearchBar.jsx'
import SearchResults from '../SearchResults/SearchResults.jsx'
import Playlist from '../Playlist/Playlist.jsx'
import Spotify from '../../util/Spotify'

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
  searchResults: [],
      playlistName: 'New Playlist',
  playlistTracks: [],
  isSaving: false,
    }
    this.addTrack = this.addTrack.bind(this)
    this.removeTrack = this.removeTrack.bind(this)
    this.updatePlaylistName = this.updatePlaylistName.bind(this)
    this.savePlaylist = this.savePlaylist.bind(this)
    this.search = this.search.bind(this)
  }

  addTrack(track) {
    const exists = this.state.playlistTracks.some(t => t.id === track.id)
    if (!exists) {
      this.setState(prev => ({ playlistTracks: [...prev.playlistTracks, track] }))
    }
  }

  removeTrack(track) {
    this.setState(prev => ({ playlistTracks: prev.playlistTracks.filter(t => t.id !== track.id) }))
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name })
  }

  async savePlaylist() {
    const trackURIs = this.state.playlistTracks.map(t => t.uri)
    if (trackURIs.length === 0) return
    this.setState({ isSaving: true })
    const ok = await Spotify.savePlaylist(this.state.playlistName, trackURIs)
    if (ok) {
      try { console.log('[Jammming] Playlist saved') } catch {}
      this.setState({ playlistName: 'New Playlist', playlistTracks: [], isSaving: false })
      try { window.alert('Playlist saved to Spotify') } catch {}
    } else {
      this.setState({ isSaving: false })
      try { window.alert('Failed to save playlist. Please try again.') } catch {}
    }
  }

  search(term) {
    Spotify.search(term).then(results => {
      this.setState({ searchResults: results })
    })
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
            <Playlist
              playlistName={this.state.playlistName}
              playlistTracks={this.state.playlistTracks}
              onRemove={this.removeTrack}
              onNameChange={this.updatePlaylistName}
              onSave={this.savePlaylist}
              isSaving={this.state.isSaving}
            />
          </div>
        </div>
      </div>
    )
  }
}
