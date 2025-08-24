import React from 'react'
import './SearchBar.css'

export default class SearchBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = { term: '' }
    this.handleTermChange = this.handleTermChange.bind(this)
  this.search = this.search.bind(this)
  this.onKeyDown = this.onKeyDown.bind(this)
  }

  handleTermChange(e) {
    this.setState({ term: e.target.value })
  }

  search() {
    const term = this.state.term?.trim()
    if (!term) return
    if (this.props.onSearch) {
      this.props.onSearch(term)
    }
  }

  onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.search()
    }
  }

  render() {
    return (
      <div className="SearchBar">
        <label htmlFor="search-term" className="sr-only">Search term</label>
        <input
          id="search-term"
          name="search-term"
          placeholder="Enter A Song, Album, or Artist"
          aria-label="Search term"
          onChange={this.handleTermChange}
          onKeyDown={this.onKeyDown}
        />
        <button className="SearchButton" onClick={this.search}>SEARCH</button>
      </div>
    )
  }
}
