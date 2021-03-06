/*
# Filename:         gpme.js
# {{{1
# Platforms:        Google Chrome
# Depends:          
* Web:              http://huyz.us/google-plus-me/
# Source:           https://github.com/huyz/google-plus-me
# Author:           Huy Z  http://huyz.us/
# Updated on:       2011-07-23
# Created on:       2011-07-11
#
# Installation:
#   Like any other browser extension.
#
# Usage:
#   Click on the titlebar of each shared post.
#   [NOT YET ENABLED: Or use the 'o' keyboard shortcut.]
#
# Thanks:
#   This extension takes some ideas from
#   https://github.com/mohamedmansour/google-plus-extension/
#   http://code.google.com/p/buzz-plus/
#   https://github.com/wittman/googleplusplus_hide_comments .

# Copyright (C) 2011 Huy Z
# 
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
# 
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/****************************************************************************
 * Constants
 ***************************************************************************/

//// For more class constants, see foldItem() in classes array

// We can't just use '.a-b-f-i-oa' cuz clicking link to the *current* page will
// refresh the contentPane
var _ID_CONTENT_PANE            = '#contentPane';
var C_NOTIFICATIONS_MARKER      = 'MJI2hd';
var C_SPARKS_MARKER             = 'a-b-OL';
var C_SINGLE_POST_MARKER        = 'a-Wf-i-M';
var C_PROFILE_PANE              = 'a-p-M-T-hk-xc';
var C_STREAM                    = 'a-b-f-i-oa';
var _C_STREAM                   = '.a-b-f-i-oa';
var _FEEDBACK_LINK              = '.a-eo-eg';
var C_FEEDBACK                  = 'tk3N6e-e-vj';
var _C_SELECTED                 = '.a-f-oi-Ai';
var _C_ITEM                     = '.a-b-f-i';
var _C_CONTENT                  = '.a-b-f-i-p';
var _C_HANGOUT_PLACEHOLDER      = '.a-b-f-i-Qi-Nd'; // Maybe more than just hangout?
var S_PHOTO                     = '.a-f-i-p-U > a.a-f-i-do';
var _C_TITLE                    = '.gZgCtb';
var _C_PERMS                    = '.a-b-f-i-aGdrWb'; // Candidates: a-b-f-i-aGdrWb a-b-f-i-lj62Ve
var _C_MUTED                    = '.a-b-f-i-gg-eb';
var C_DATE                      = 'a-b-f-i-Ad-Ub';
var _C_DATE                     = '.a-b-f-i-Ad-Ub';
var _C_DATE_CSS                 = '.a-f-i-Ad-Ub';
var _C_COMMENTS_ALL_CONTAINER   = '.a-b-f-i-Xb';
var C_COMMENTS_ALL_CONTAINER    = 'a-b-f-i-Xb';
var C_COMMENTS_OLD_CONTAINER    = 'a-b-f-i-cf-W-xb';
var _C_COMMENTS_OLD_CONTAINER   = '.a-b-f-i-cf-W-xb';
var _C_COMMENTS_OLD             = '.a-b-f-i-gc-cf-Xb-h';
var _C_COMMENTS_OLD_NAMES       = '.a-b-f-i-cf-W-xb .a-b-f-i-je-oa-Vb';
var C_COMMENTS_SHOWN_CONTAINER  = 'a-b-f-i-Xb-oa';
var _C_COMMENTS_SHOWN_CONTAINER = '.a-b-f-i-Xb-oa';
var _C_COMMENTS_SHOWN           = '.a-b-f-i-W-r';
var _C_COMMENTS_SHOWN_NAMES     = '.a-b-f-i-W-r a.a-f-i-W-Zb';
var C_COMMENTS_SHOWN_CONTENT    = 'a-f-i-ZP25p';
var C_COMMENTS_MORE_CONTAINER   = 'a-b-f-i-Sb-W-xb';
var _C_COMMENTS_MORE_CONTAINER  = '.a-b-f-i-Sb-W-xb';
var _C_COMMENTS_MORE            = '.a-b-f-i-gc-Sb-Xb-h';
var _C_COMMENTS_MORE_NAMES      = '.a-b-f-i-Sb-W-xb .a-b-f-i-je-oa-Vb';
//var _C_COMMENTS_CONTAINER     = '.a-b-f-i-Xb-oa';
var _C_COMMENT_EDITOR           = '.a-b-f-i-Pb-W-t';
var _ID_STATUS_BG               = '#gbi1a';
var _ID_STATUS_FG               = '#gbi1';
var C_STATUS_BG_OFF             = 'gbid';
var C_STATUS_FG_OFF             = 'gbids';
var _C_SHARE_LINE               = '.a-f-i-bg';
var _C_EMBEDDED_VIDEO           = '.ea-S-Bb-jn > div';
var S_PROFILE_POSTS             = 'div[id$="-posts-page"]';

var _C_COMMENT_CONTAINERS =
  [ _C_COMMENTS_OLD_CONTAINER, _C_COMMENTS_SHOWN_CONTAINER, _C_COMMENTS_MORE_CONTAINER ];

var C_COMMENTCOUNT_NOHILITE = 'gpme-comment-count-nohilite';

// XXX We assume there is no substring match problem because
// it doesn't look like any class names would be a superstring of these
var COMMENT_CONTAINER_REGEXP = new RegExp('\\b(?:' + C_COMMENTS_OLD_CONTAINER + '|' + C_COMMENTS_SHOWN_CONTAINER + '|' + C_COMMENTS_MORE_CONTAINER + '|' + C_COMMENTS_SHOWN_CONTENT + ')\\b');
var DISABLED_PAGES_URL_REGEXP = new RegExp(/\/(posts|notifications|sparks)\//);
var DISABLED_PAGES_CLASSES = [
  C_NOTIFICATIONS_MARKER,
  C_SPARKS_MARKER,
  C_SINGLE_POST_MARKER
];

/****************************************************************************
 * Init
 ***************************************************************************/

// list or expanded mode (like on GReader)
var displayMode;

// In list mode, an item that was opened but may need to be reclosed
// once the location.href is corrected
var $lastTentativeOpen = null;

var $lastPreviewedItem = null;

var lastCommentCountUpdateTimers = {};

// Shared DOM: the titlebar
var titlebarTpl = document.createElement('div');
titlebarTpl.setAttribute('class', 'gpme-titlebar');
titlebarTpl.innerHTML = '<div class="' + C_FEEDBACK + '"><div class="gpme-fold-icon gpme-fold-icon-unfolded-left">\u25bc</div><div class="gpme-fold-icon gpme-fold-icon-unfolded-right">\u25bc</div><span class="gpme-title"></span></div>';
var $titlebarTpl = $(titlebarTpl);
$titlebarTpl.click(onTitlebarClick);

var commentbarTpl = document.createElement('div');
commentbarTpl.setAttribute('class', 'gpme-commentbar');
commentbarTpl.innerHTML = '<div class="' + C_FEEDBACK + '"><div class="gpme-fold-icon gpme-comments-fold-icon-unfolded gpme-comments-fold-icon-unfolded-top">\u25bc</div><div class="gpme-fold-icon gpme-comments-fold-icon-unfolded-bottom">\u25bc</div><span class="gpme-comments-title"></span></div>';
var $commentbarTpl = $(commentbarTpl);
$commentbarTpl.click(onCommentbarClick);

var postWrapperTpl = document.createElement('div');
postWrapperTpl.className = 'gpme-post-wrapper';
var clickWall = document.createElement('div');
clickWall.className = 'gpme-disable-clicks';
clickWall.style.position = 'absolute';
clickWall.style.height = '100%';
clickWall.style.width = '100%';
clickWall.style.zIndex = '12'; // higher than .gpme-folded .a-f-i-Ia-D
clickWall.style.display = 'none';
var previewTriangleSpan = document.createElement('span');
previewTriangleSpan.className = 'gpme-preview-triangle';
previewTriangleSpan.style.backgroundImage = 'url(' + chrome.extension.getURL('/images/preview-triangle.png') + ')';
postWrapperTpl.appendChild(clickWall);
postWrapperTpl.appendChild(previewTriangleSpan);
var $postWrapperTpl = $(postWrapperTpl);

var commentsWrapperTpl = document.createElement('div');
commentsWrapperTpl.className = 'gpme-comments-wrapper';
var $commentsWrapperTpl = $(commentsWrapperTpl);

// For instant previews, hoverIntent
var hoverIntentConfig = {    
  handlerIn: showPreview, // function = onMouseOver callback (REQUIRED)    
  delayIn: 400, // number = milliseconds delay before onMouseOver
  handlerOut: hidePreview, // function = onMouseOut callback (REQUIRED)    
  delayOut: 350, // number = milliseconds delay before onMouseOut    
  exclusiveSet: null // name of exclusiveSet to which the target belongs
};

// Duration of clickwall.
// NOTE: timeout must be less than jquery.hoverIntent's overTimeout, otherwise
// the preview will go away.
var clickWallTimeout = 300;

/****************************************************************************
 * Utility
 ***************************************************************************/

/**
 * For debugging
 */
function trace(msg) {
  //console.log(typeof msg == 'object' ? msg instanceof jQuery ? msg.get() : msg : 'g+me: ' + msg);
}
function debug(msg) {
  console.debug(typeof msg == 'object' ? msg instanceof jQuery ? msg.get() : msg : 'g+me.' + msg);
}
function warn(msg) {
  console.warn(typeof msg == 'object' ? msg instanceof jQuery ? msg.get() : msg : 'g+me.' + msg);
}
function error(msg) {
  console.error(typeof msg == 'object' ? msg instanceof jQuery ? msg.get() : msg : 'g+me.' + msg);
}

/**
 * Check if should enable on certain pages
 * @param $subtree: Optional, to force checking of DOM in cases when the
 *   href is not yet correct and the Ajax updates are pending
 */
function isEnabledOnThisPage($subtree) {
  if (typeof $subtree == 'undefined')
    return ! DISABLED_PAGES_URL_REGEXP.test(window.location.href);

  for (var c in DISABLED_PAGES_CLASSES) {
    if ($subtree.hasClass(DISABLED_PAGES_CLASSES[c]) || $subtree.find('.' + DISABLED_PAGES_CLASSES[c]).length) {
      debug("isEnabledOnThisPage: disabling because match on " + DISABLED_PAGES_CLASSES[c]);
      return false;
    }
  }
  return true;
}

/**
 * Shorten date text to give more room for snippet
 * FIXME: English-specific
 */
function abbreviateDate(text) {
  return text.replace(/\s*\(edited.*?\)/, '').replace(/Yesterday/g, 'Yest.');
}

/**
 * Iterates through all the comment containers and calls the callback
 */
function foreachCommentContainer($subtree, callback) {
  for (var container in _C_COMMENT_CONTAINERS) {
    var $container = $subtree.find(_C_COMMENT_CONTAINERS[container]);
    if ($container.length)
      callback($container);
  }
}

/**
 * Queries background page for options
 */
function getOptionsFromBackground(callback) {
  chrome.extension.sendRequest({action: 'gpmeGetModeOption'}, function(response) {
    displayMode = response;
    callback();
  });
}

/**
 * Returns a throttle function kk2
 * */
/****************************************************************************
 * Event Handlers
 ***************************************************************************/

/**
 * Responds to DOM updates from G+ to handle change in status of new notifications shown to the user
 */
function onStatusUpdated(e) {
  debug("onStatusUpdated");
  chrome.extension.sendRequest({action: 'gpmeStatusUpdate', count: parseInt(e.target.innerText, 10)});
}

/**
 * Responds to changes in the history state
 */
function onTabUpdated() {
  trace("event: Chrome says that tab was updated");

  // Restrict to non-single-post Google+ pages
  if (!isEnabledOnThisPage())
    return;

  // If list mode, make sure the correct last opened entry is unfolded, now
  // that we know that window.location.href is correct
  if (displayMode == 'list')
    unfoldLastOpenInListMode();
}

/**
 * Responds to a reconstruction of the content pane, e.g.
 * when the user clicks on the link that points to the same
 * page we're already on, or when switching from About to Posts
 * on a profile page.
 */
function onContentPaneUpdated(e) {
  // We're only interested in the insertion of entire content pane
  trace("event: DOMNodeInserted within onContentPaneUpdated");

  var $subtree = $(e.target);
  if (isEnabledOnThisPage($subtree))
    updateAllItems($subtree);

  // (Re-)create handler for insertions into the stream
  // No longer needed: we'll just handle it in the single DOMNodeInserted event handler
  //$stream = $(e.target).find(_C_STREAM).bind('DOMNodeInserted', onStreamUpdated);
}

/**
 * Responds to DOM updates from G+ to handle incoming items.
 * Calls updateItem()
 */
function onStreamUpdated(e) {
  if (! isEnabledOnThisPage())
    return;

  trace("event: DOMNodeInserted within stream");
  debug("onStreamUpdated: DOMNodeInserted for item id=" + e.target.id + " class='" + e.target.className);
  updateItem($(e.target));
}

/**
 * Responds to DOM updates from G+ to handle changes to old comment counts
 */
function onCommentsUpdated(e, $item) {
  var id = e.target.id;
  var className = e.target.className;

  //trace("event: DOM insertion or deletion of comments");
  debug("onCommentsUpdated: DOM insertion/deletion of comments for item id=" + id + " class='" + e.target.className + "'");

  // We may be getting events just from a jquery find for comments,
  // before things are set up.
  if (! $item.hasClass('gpme-enh'))
    return;

  /*
  // If the user is editing, we should unfold comments
  if ($target.hasClass(C_COMMENTS_ALL_CONTAINER) && $target.find(_C_COMMENT_EDITOR).length && $item.hasClass('gpme-comments-folded')) {
    unfoldComments(true, $item);
  }
  */

  updateItemComments($item);
}

/**
 * Responds to click on post titlebar.
 * Calls toggleItemFolded()
 */
function onTitlebarClick() {
  // NOTE: event arg doesn't seem to work for me
  var $item = $(this).parent();
  debug("onTitlebarClick: " + $item.attr('id'));

  toggleItemFolded($item);
}

/**
 * Responds to click on post titlebar.
 * Calls toggleItemFolded()
 */
function onCommentbarClick() {
  // NOTE: event arg doesn't seem to work for me
  var $item = $(this).closest(_C_ITEM);
  debug("onCommentbarClick: " + $item.attr('id'));

  toggleCommentsFolded($item);
}

/**
 * Responds to the keypress for open/close item.
 * Calls toggleItemFolded()
 */
function onFoldKey(e, attempt) {
  debug("onFoldKey attempt=" + (typeof attempt == 'undefined' ? 0 : attempt));
  // Find selected item
  var $selectedItem = $(_C_SELECTED);
  if ($selectedItem.length == 1) {
    if (! toggleItemFolded($selectedItem.first())) {
      // If we couldn't fold, then movement was in motion, we try again in a bit
      if (typeof(attempt) == 'undefined')
        attempt = 0;
      if (attempt < 4) {
        setTimeout(function() {
          onFoldKey(e, attempt + 1);
        }, 200);
      }
    }
  }
}

/**
 * Responds to changes in mode option
 */
function onModeOptionUpdated(newMode) {
  debug("onModeOptionUpdated: new mode=" + newMode);

  if (! isEnabledOnThisPage())
    return;

  // If mode has changed
  var oldMode = displayMode;
  displayMode = newMode;
  if (typeof(oldMode) == 'undefined' || displayMode != oldMode)
    refreshAllFolds();
}

/**
 * Responds to reset all
 */
function onResetAll() {
  debug("onResetAll");

  var oldMode = displayMode;
  for (var i in localStorage) {
    if (i.indexOf('gpme_') === 0)
      localStorage.removeItem(i);
  }

  getOptionsFromBackground(function() {
    // If mode has changed
    debug("onResetAll: oldMode=" + oldMode + " newMode=" + displayMode);
    if (typeof(oldMode) == 'undefined' || displayMode != oldMode)
      refreshAllFolds();
  });
}

/****************************************************************************
 * DOM enhancements & folding according to state
 ***************************************************************************/

/**
 * Injects styles in current document
 */
function injectCSS() {
  var linkNode  = document.createElement('link');
  linkNode.rel = 'stylesheet';
  linkNode.type = 'text/css';
  linkNode.href = chrome.extension.getURL('gpme.css') + '?' + new Date().getTime();
  document.getElementsByTagName('head')[0].appendChild(linkNode);

  // Apparently, the background-position is incorrect for a user.
  // Maybe the notification status displays something differently for him
  // early in the loading of the page.
  // Let's hardcode the coords, only in this situation
  function hardcodeCoords($node) {
    return window.getComputedStyle($node.get(0)).cssText.
      replace(/(background-position:\s+-?0\s*(?:px)?\s+)-394\s*px/, '$1 0 -274px').
      replace(/(background-position:)\s+-37\s*px\s+-394\s*px/, '$1 -26px -274px');
  }

  // Copy G+ notification status bg style because original is by ID.
  // We use a convoluted manner of copying styles in case G+ changes
  // the CSS image sprite.
  // XXX There must be an easier way than to getComputedStyle()
  var styleNode = document.createElement('style');
  styleNode.setAttribute('type', 'text/css');
  var statusNode, statusOff, cssText;
  $statusNode = $(_ID_STATUS_BG);
  if ($statusNode.length) {
    // We have to temporarily remove the class 'gbid' (turns bg to
    // gray), which seems to be there by default.
    statusOff = $statusNode.hasClass(C_STATUS_BG_OFF);
    if (statusOff)
      $statusNode.removeClass(C_STATUS_BG_OFF);
    styleNode.appendChild(document.createTextNode('.gpme-comment-count-bg { ' +
      hardcodeCoords($statusNode) + ' } '));
    $statusNode.addClass(C_STATUS_BG_OFF);
    styleNode.appendChild(document.createTextNode('.gpme-comment-count-bg.' + C_COMMENTCOUNT_NOHILITE + ' { ' +
      hardcodeCoords($statusNode) + ' } '));
    if (! statusOff)
      $statusNode.removeClass(C_STATUS_BG_OFF);
  }

  // Copy G+ notification status fg style because original is by ID
  $statusNode = $(_ID_STATUS_FG);
  if ($statusNode.length) {
    // We have to temporarily remove the class 'gbids' (turns bg to
    // gray), which seems to be there by default.
    statusOff = $statusNode.hasClass(C_STATUS_FG_OFF);
    if (statusOff)
      $statusNode.removeClass(C_STATUS_FG_OFF);
    styleNode.appendChild(document.createTextNode('.gpme-comment-count-fg { ' +
      hardcodeCoords($statusNode) + ' } '));
    $statusNode.addClass(C_STATUS_FG_OFF);
    styleNode.appendChild(document.createTextNode('.gpme-comment-count-fg.' + C_COMMENTCOUNT_NOHILITE + ' { ' +
      hardcodeCoords($statusNode) + ' } '));
    if (! statusOff)
      $statusNode.removeClass(C_STATUS_FG_OFF);
  }

  document.getElementsByTagName('head')[0].appendChild(styleNode);
}

/**
 * Injects code to make the Feedback button work
 */
function injectNewFeedbackLink() {
  //var $link = $('.a-eo-eg');
  //alert($link.attr('onclick'));
  //$link.attr('onclick', 'alert("shit");');
  //$link.click(function(event) { alert("yes"); if (confirm("sheeet")) return appfeedback.startFeedback(event); else return false; });
  //$link.click(function(event) { alert("yes") });
  //$link.attr('onclick', 'alert("yes");');
  //alert($link.attr('onclick'));
}

/**
 * Refresh fold/unfolded display of items.
 * Called by onModeOptionUpdated() and onResetAll()
 */
function refreshAllFolds() {
  // Force refresh of folding
  updateAllItems();

  // If going to expanded mode, we want to unfold the last item opened in list mode
  if (displayMode == 'expanded') {
    var id = localStorage.getItem("gpme_post_last_open_" + window.location.href);
    if (id !== null) {
      var $item = $('#' + id);
      //debug("onModeOptionUpdated: last open id=" + id + " $item.length=" + $item.length);
      if ($item.length == 1) {
        unfoldItem(false, $item);
      }
    }
  }
}

/**
 * Update all the items in the current page.
 * Is called by main() and onModeOptionUpdated()
 */
function updateAllItems($subtree) {
  //debug("updateAllItems");
  
  // Default to updating all divs in contentpane,
  // but sometimes we know which one was just inserted by
  // an Ajax refresh
  if (typeof $subtree == 'undefined')
    $subtree = $(_C_STREAM);
  
  // Update all items
  $subtree.find(_C_ITEM).each(function(i, item) {
    debug("updateAllItems #" + i);
    i++;
    updateItem($(item));
  });

  // If list mode, make sure the correct last opened entry is unfolded, but
  // only when we know that window.location.href is correct
  if (typeof $subtree == 'undefined' && displayMode == 'list')
    unfoldLastOpenInListMode();
}


/**
 * In list mode, unfold the last opened entry, refolding any wrongly unfolded entry
 * NOTE: At this point, location.href may or may not be correct.
 */
function unfoldLastOpenInListMode() {
  //debug("unfoldLastOpenInListMode: href=" + window.location.href);
  var lastOpenId = localStorage.getItem("gpme_post_last_open_" + window.location.href);

  // Undo any incorrectly-unfolded item
  // NOTE: lastOpenId could be null, which means this is a page that wasn't visited
  // before in list mode or a page that had all items closed; we still want to close
  // the incorrectly-opened item
  // FIXME: we still get the flash of an open-then-closed item
  // XXX Strange: if I search lastTentativeOpen by id, I may be hiding an entry that
  // won't be shown.  Would be interesting to investigate further, as it probably
  // has to do with the way the DOM updates happen with G+.
  if ($lastTentativeOpen !== null && $lastTentativeOpen.attr('id') != lastOpenId) {
    //debug("unfoldLastOpenInListMode: unfolding " + $lastTentativeOpen.attr('id'));
    foldItem(false, $lastTentativeOpen);
    $lastTentativeOpen = null;
  }

  if (lastOpenId !== null) {
    // We explicitly open in order to close any previously opened item
    // FIXME: this favors the oldest instead of the most recent opened item
    unfoldItem(false, $('#' + lastOpenId));
  }
}

/**
 * Updates fold/unfold appropriately, except in list mode where the
 * caller is responsible for unfolding the appropriate item.
 */
function updateItem($item) {
  var id = $item.attr('id');
  debug("updateItem: " + id);

  var enhanceItem = ! $item.hasClass('gpme-enh');

  if (enhanceItem) {
    // Add titlebar
    var $itemContent = $item.find(_C_CONTENT);
    if ($itemContent.length != 1) {
      if ($item.find(_C_HANGOUT_PLACEHOLDER).length) {
        setTimeout(function() { updateItem($item); }, 100 );
      } else {
        error("updateItem: Can't find content of item " + id + " hits=" + $itemContent.length);
        error($item.html());
      }
      return;
    }
    // NOTE: we have to change the class before inserting or we'll get more
    // events and infinite recursion.
    //debug("updateItem: enhancing");
    $item.addClass('gpme-enh');

    // Add hover event handler
    $item.hoverIntent(hoverIntentConfig);
    //$item.hover(showPreview, hidePreview);

    var $titlebar = $titlebarTpl.clone(true);
    $titlebar.insertBefore($itemContent);

    // Insert container for post content so that we can turn it into an instant
    // preview
    var $wrapper = $postWrapperTpl.clone().insertAfter($titlebar);
    $wrapper.append($itemContent);

    // Structure commentbar:
    // "a-b-f-i-Xb"
    //   "gpme-commentbar"
    var $allCommentContainer = $item.find(_C_COMMENTS_ALL_CONTAINER);
    // It's possible not to have comments at all on posts with comments
    // disabled or on photo-tagging posts
    if ($allCommentContainer.length) {
      var $commentbar = $commentbarTpl.clone(true);
      $allCommentContainer.prepend($commentbar);

      // Insert wrapper for comments container so that we can hide it without
      // triggering DOMSubtreeModified events on the container
      $wrapper = $commentsWrapperTpl.clone().insertAfter($commentbar);
      foreachCommentContainer($allCommentContainer, function($container) {
        $wrapper.append($container);
      });
    }
  }

  // Refresh fold of post
  var itemFolded = false;
  if (displayMode == 'list') {
    // Check if it's supposed to be unfolded
    // NOTE: the href may be incorrect at this point if the user is clicking on a new
    // stream link and the updates are coming in through AJAX *before* a tabUpdated event
    var lastOpenId = localStorage.getItem("gpme_post_last_open_" + window.location.href);

    if (lastOpenId !== null && id == lastOpenId) {
      unfoldItem(false, $item);

      // Record this operation because we may have to undo it once location.href is
      // known to be correct
      $lastTentativeOpen = $item;
    } else {
      foldItem(false, $item);
      itemFolded = true;
    }
  } else if (displayMode == 'expanded') {
    itemFolded = localStorage.getItem("gpme_post_folded_" + id);
    // Fold if necessary
    if (itemFolded !== null) {
      foldItem(false, $item);
    } else {
      unfoldItem(false, $item);
    }
  }

  // Refresh fold of comments if visible
  if (! itemFolded) {
    if (localStorage.getItem("gpme_comments_folded_" + id))
      foldComments(false, $item);
    else
      unfoldComments(false, $item);
  }

  // Start listening to updates to comments.
  // We need to listen all the time since comments can come in or out.
  if (enhanceItem) {
    // We must have one throttle function per comment section within item.
    var commentsUpdateHandler = $.throttle(200, 50, function(e) { onCommentsUpdated(e, $item); });

    //var commentsUpdateHandler = function(e) { onCommentsUpdated(e, $item) };
    foreachCommentContainer($item.find('.gpme-comments-wrapper'), function($container) {
      $container.bind('DOMSubtreeModified', function(e) {
        // We have to filter out junk before we call the throttle function; otherwise
        // the last callback call will have junk arguments.
        var id = e.target.id;
        // Some optimizations, especially to prevent lag when typing comments.
        if (id && id.charAt(0) == ':' || ! isEnabledOnThisPage())
          return;

        var className = e.target.className;
        // If the target has id, then it's probably a comment
        if (! id && ! COMMENT_CONTAINER_REGEXP.test(className))
          return;

        // Finally call our throttled callback
        commentsUpdateHandler(e);
      });
    });
  }
}

/**
 * Updates the display of comments
 */
function updateItemComments($item) {
  if ($item.hasClass('gpme-comments-folded')) {
    foldComments(false, $item);
  } else {
    unfoldComments(false, $item);
  }
}

/****************************************************************************
 * Post Folding/unfolding logic
 ***************************************************************************/

/**
 * Toggle viewable state of the content of an item.
 * This is only called as a result of a user action.
 * Calls foldItem() or unfoldItem().
 * @return true if toggling worked
 */
function toggleItemFolded($item) {
  var $post = $item.find('.gpme-post-wrapper');
  //debug("toggleItemFolded: length=" + $posts.length);
  if ($post.length != 1) {
    // It is possible to not have a proper match during keyboard scrolling
    // (hit 'j' and 'o' in quick succession)
    //debug("toggleItemFolded: improper match: " + $posts.length);
    return false;
  }

  var id = $item.attr('id');
  if ($item.hasClass('gpme-folded')) {
    // If in list mode, we need to fold the previous one
    if (displayMode == 'list') {
      lastOpenId = localStorage.getItem('gpme_post_last_open_' + window.location.href);
      //debug("unfoldItem: last open id=" + lastOpenId);
      if (lastOpenId !== null && lastOpenId != id) {
        //debug("unfoldItem: href=" + window.location.href + " id =" + id + " lastOpenId=" + lastOpenId);
        var $lastItem = $('#' + lastOpenId);
        if ($lastItem.length && $lastItem.hasClass('gpme-enh')) {
          foldItem(true, $lastItem);
        }
      }
    }

    unfoldItem(true, $item, $post);

    // Since this thread is a result of an interactive toggle, we record last open
    debug("toggleItemFolded: href=" + window.location.href);
    debug("toggleItemFolded: gpme_post_last_open_" + window.location.href + "->id = " + id);
    localStorage.setItem("gpme_post_last_open_" + window.location.href, id);
  } else {
    foldItem(true, $item, $post);

    // Since this thread is a result of an interactive toggle, we delete last open
    if (localStorage.getItem("gpme_post_last_open_" + window.location.href) == id)
      localStorage.removeItem("gpme_post_last_open_" + window.location.href);
  }

  return true;
}

/**
 * Fold item, and give titlebar summary content if necessary
 * @param $post: Optional if you have it
 */
function foldItem(interactive, $item, $post) {
  if (typeof($post) == 'undefined') {
    $post = $item.find('.gpme-post-wrapper');
    if ($post.length != 1) {
      error("foldItem: Can't find post content node");
      error($item);
      return;
    }
  }

  var id = $item.attr('id');

  // Persist for expanded mode
  debug("foldItem: id=" + id);
  if (displayMode == 'expanded')
    localStorage.setItem("gpme_post_folded_" + id, true);

  // Visual changes
  //$post.fadeOut().hide(); // This causes race-condition when double-toggling quickly.
  $post.hide();
  $item.addClass('gpme-folded');
  $item.removeClass('gpme-unfolded');
  //debug("foldItem: id=" + id + " folded=" + $item.hasClass('gpme-folded') + " post.class=" + $post.attr('class') + " should be folded!");

  // If interactive folding and comments are showing, record the comment count
  var commentCount = countComments($item);
  if (interactive && ! $item.hasClass('gpme-comments-folded'))
    saveSeenCommentCount(id, commentCount);

  // Attached or pending title
  var $subtree;

  // If not yet done, put content in titlebar
  var $title = $subtree = $item.find('.gpme-title');
  if (! $title.hasClass('gpme-has-content')) {
    $title.addClass('gpme-has-content');

    var $srcTitle = $item.find(_C_TITLE);
    if ($srcTitle.length != 1) {
      error("foldItem: can't find post content title node");
      error($item);
    } else {
      // NOTE: don't just take the first div inside post content title because
      // sometimes the hangout 'Live' icons is there
      var $clonedTitle = $subtree = $srcTitle.clone();

      var $srcPhoto = $item.find(S_PHOTO);
      if ($srcPhoto.length) {
        $clonedTitle.prepend($srcPhoto.clone());
      }

      // Insert fold icon
      $clonedTitle.prepend('<span class="gpme-fold-icon">\u25b6</span>');

      // Take out permissions
      var $perms = $clonedTitle.find(_C_PERMS);
      if ($perms.length > 0) {
        $perms.remove();
      } else {
        error("foldItem: can't find permissions div");
        error($clonedTitle);
      }

      // Put in snippet, trying differing things
      var classes = [
        '.a-b-f-i-u-ki', // poster text
        '.a-b-f-i-p-R', // original poster text (and for one's own post, just "Edit")
        '.a-b-f-S-oa', // poster link (must come after .a-b-f-i-p-R, which sometimes it's just "Edit")
        '.a-f-i-ie-R', // hangout text
        '.w0wKhb', // "A was tagged in B"
        '.ea-S-pa-qa', // photo caption
        '.a-f-i-p-qb .a-b-h-Jb', // photo album
        '.ea-S-R-h', // title of shared link
        '.ea-S-Xj-Cc' // text of shared link
      ];
      for (var c in classes) {
        var $snippet = $item.find(classes[c]);
        if (! $snippet.length)
          continue;

        // We want to ignore link shares that only have the text Edit
        // <span class="a-Ja-h a-f-i-Ka-Ja a-b-f-i-Ka">Edit</span>
        if (classes[c] == '.a-b-f-i-u-ki' || classes[c] == '.a-b-f-i-p-R') {
          $snippet = $snippet.clone();
          $snippet.find('.a-b-f-i-Ka').remove();
        }
        var text = $snippet.text();
        if (text.match(/\S/)) {
          if (classes[c] == '.a-f-i-ie-R') {
            // FIXME: English-specific
            text = text.replace(/.*hung out\s*/, '');
          }
          $snippet = $('<span class="gpme-snippet"></span');
          $snippet.text(text); // We have to add separately to properly escape HTML tags
          $clonedTitle.append($snippet);
          break;
        }
      }

      // Add comment-count container
      $clonedTitle.prepend('<div class="gpme-comment-count-container" style="display:none">' +
        '<span class="gpme-comment-count-bg ' + C_COMMENTCOUNT_NOHILITE + '"></span>' +
        '<span class="gpme-comment-count-fg ' + C_COMMENTCOUNT_NOHILITE + '"></span></div>');

      // Take out date marker so that G+ doesn't update the wrong copy
      var $clonedDate = $clonedTitle.find(_C_DATE);
      if (! $clonedDate.length) {
        error("foldItem: Can't find date marker");
        error($clonedTitle);
      } else {
        $clonedDate.removeClass(C_DATE);

        // If any, move "- Muted" to right after date and before the " - "
        $clonedTitle.find(_C_MUTED).insertAfter($clonedDate);

        // Inject the summary title
        $title.append($clonedTitle);

        // Stop propagation of click from the name
        // NOTE: done here coz it can't be done on a detached node.
        $clonedTitle.find('a').click(function(e) {
          e.stopPropagation();
        });

        // For first page display, the date is there, but for updates, the date isn't there yet.
        // So check, and try again later in case of updates.
        var attempt = 40;
        (function insertTitleWhenDateUpdated($date) {
          attempt--;
          if ($date.length && $date.text() != '#' || attempt < 0) {
            var dateText = '';
            if (attempt < 0) {
              error("insertTitleWhenDateUpdated: gave up on getting the date for id=" + id);
            } else {
              dateText = abbreviateDate($date.text());
            }
            // Strip out the A link because we don't want to make it clickable
            // Not only does clicking it somehow opens a new window, but we need
            // the clicking space especially with instant previews
            $clonedDate.text(dateText);

          } else {
            var $srcDateA = $item.find(_C_DATE + ' a');

            if ($srcDateA.length) {
              // Try again later in a little bit
              setTimeout(function() { insertTitleWhenDateUpdated($srcDateA); }, 50);
            } else {
              error("insertTitleWhenDateUpdated: can't find the source date div");
              error($srcDateA);
            }
          }
        })($clonedDate.find('a'));
      }
    }
  }

  /* Gonna be harder than this :)
  // If interactive, then we want to stop any playing youtube video
  // by undoing what clicking play does
  var $embed = $post.find(_C_EMBEDDED_VIDEO + '> iframe');
  if ($embed.length) {
    var $embedParent = $embed.parent();
    $embedParent.find('img').show();
    $embedParent.find('div').show();
    $embedParent.attr({ 'aria-pressed': '', 'aria-selected': '', 'aria-expanded': '' }).
      removeClass('ea-S-Pa ea-S-Ya'); // Classes not important -- probably on affects iframe
    $embed.remove();
  }
  */

  // Show possibly-hidden comments so that they appear in the preview (but don't persist)
  var $comments = $item.find('.gpme-comments-wrapper');
  if ($comments.length) {
    $comments.show();
  }

  // Updated the count in the subtree
  updateCommentCount(id, $subtree, commentCount);
}

/**
 * For both list and expanded mode, unfolds the item.
 * @param $post: Optional if you have it
 */
function unfoldItem(interactive, $item, $post) {
  if (typeof($post) == 'undefined') {
    $post = $item.find('.gpme-post-wrapper');
    if ($post.length != 1) {
      //debug("unfoldItem: $posts.length=" + $posts.length);
      return;
    }
  }

  var id = $item.attr('id');
  debug("unfoldItem: id=" + id);

  // Persist for expanded mode
  if (displayMode == 'expanded')
    localStorage.removeItem("gpme_post_folded_" + id);

  // Visual changes
  $post.show();
  $item.removeClass('gpme-folded');
  $item.addClass('gpme-unfolded');

  // Refresh fold of comments
  // NOTE: this must be done after the CSS classes are updated
  if (localStorage.getItem("gpme_comments_folded_" + id))
    foldComments(false, $item);
  else
    unfoldComments(false, $item);

  if (interactive && ! $item.hasClass('gpme-comments-folded'))
    deleteSeenCommentCount(id);

  // Scroll into view because on a short web page for list mode because
  // the closing of another post can move the post we're trying to open
  if (displayMode == 'list')
    $item.scrollintoview();

}

/****************************************************************************
 * Comment folding/unfolding logic
 ***************************************************************************/

/**
 * Toggle viewable state of the comments of an item.
 * This is only called as a result of a user action.
 * Calls foldComments() or unfoldComments().
 * @return true if toggling worked
 */
function toggleCommentsFolded($item) {
  var $comments = $item.find('.gpme-comments-wrapper');
  //debug("toggleCommentsFolded: length=" + $posts.length);
  if ($comments.length != 1) {
    error("toggleCommentsFolded: Can't find comments");
    error($item);
    return false;
  }

  var id = $item.attr('id');
  if ($item.hasClass('gpme-comments-folded')) {
    unfoldComments(true, $item, $comments);
  } else {
    foldComments(true, $item, $comments);
  }

  return true;
}

/**
 * Fold comments and show some content in the bar
 * @param $comments: Optional
 */
function foldComments(interactive, $item, $comments) {
  if (typeof($comments) == 'undefined') {
    $comments = $item.find('.gpme-comments-wrapper');
    if ($comments.length != 1) {
      // Photo-tagging posts don't have comments
      //error("foldComments: Can't find comments container node for " + $item.attr('id'));
      //error($item);
      return;
    }
  }

  var id = $item.attr('id');
  debug("foldComments: id=" + id);
  var commentCount = countComments($item);

  // If result of user action
  if (interactive) {
    // Persist
    localStorage.setItem("gpme_comments_folded_" + id, true);

    saveSeenCommentCount(id, commentCount);

    // Visual changes
    var shownCommentCount = countShownComments($item);
    var duration = shownCommentCount <= 4 ? 50 : shownCommentCount <= 10 ? 150 : 250;
    var $commentbar = $item.find('.gpme-commentbar > div');
    $commentbar.slideUp(duration);
    $comments.css('min-height', '27px').slideUp(duration, function() {
      $item.addClass('gpme-comments-folded');
      $item.removeClass('gpme-comments-unfolded');
      updateCommentbar(id, $item, commentCount);
      $commentbar.show(); // undo the hiding of sliding up
    });
    var $shareLine = $item.find(_C_SHARE_LINE);
    ($shareLine.length? $shareLine : $item).scrollintoview({ duration: duration, direction: 'y' });

  } else {
    // Visual changes
    $comments.hide();
    $item.addClass('gpme-comments-folded');
    $item.removeClass('gpme-comments-unfolded');
  }

  // If not yet done, put content in titlebar
  var $title = $item.find('.gpme-comments-title');
  if (! $title.hasClass('gpme-comments-has-content')) {
    $title.addClass('gpme-comments-has-content');

    // Insert placeholder for snippet
    $title.prepend('<span class="gpme-comments-snippet"></span>');

    // Insert fold icon
    $title.prepend('<span class="gpme-fold-icon">\u25b6</span>');

    // Add comment-count container
    $title.prepend('<div class="gpme-comment-count-container" style="display:none">' +
      '<span class="gpme-comment-count-bg ' + C_COMMENTCOUNT_NOHILITE + '"></span>' +
      '<span class="gpme-comment-count-fg ' + C_COMMENTCOUNT_NOHILITE + '"></span></div>');
  }

  if (! interactive)
    updateCommentbar(id, $item, commentCount);
}

/**
 * Unfold comments
 * @param $comments: Optional
 */
function unfoldComments(interactive, $item, $comments) {
  if (typeof($comments) == 'undefined') {
    $comments = $item.find('.gpme-comments-wrapper');
    if ($comments.length != 1) {
      // Photo-tagging posts don't have comments
      //error("foldItem: Can't find comments container node");
      //error($item);
      return;
    }
  }

  var id = $item.attr('id');
  debug("unfoldComments: id=" + id);
  var commentCount = countComments($item);

  if (interactive) {
    // Persist
    localStorage.removeItem("gpme_comments_folded_" + id);

    // Interactive visual changes
    var shownCommentCount = countShownComments($item);
    var duration = shownCommentCount <= 4 ? 50 : shownCommentCount <= 10 ? 150 : 250;
    var $commentbar = $item.find('.gpme-commentbar > div');
    $commentbar.hide();
    $comments.slideDown(duration, function() {
      $item.removeClass('gpme-comments-folded');
      $item.addClass('gpme-comments-unfolded');
      // NOTE: updateCommentbar needs to be done after updating classes
      updateCommentbar(id, $item, commentCount);
      $commentbar.fadeIn(200);
    });

    deleteSeenCommentCount(id);
  } else {
    // Automated visual changes
    $comments.show();
    $item.removeClass('gpme-comments-folded');
    $item.addClass('gpme-comments-unfolded');
    // NOTE: updateCommentbar needs to be done after updating classes
    updateCommentbar(id, $item, commentCount);
  }
}

/****************************************************************************
 * Comment counting & snippet
 ***************************************************************************/

/**
 * Update the commentbar
 */
function updateCommentbar(id, $item, commentCount) {
  updateCommentCount(id, $item, commentCount);
  updateCommentsSnippet(id, $item);
  updateCommentbarHeight(id, $item, commentCount);
}

/**
 * Update the displayed comment count.
 * NOTE: this can display negative counts if someone deletes a comment;
 * FIXME: there's no handling for the deletion of a comment and then
 *   the adding of a comment -- that just looks like there was no change
 */
function updateCommentCount(id, $subtree, count) {
  //debug("updateCommentCount: id=" + id + " count=" + count);
  //
  var $container = $subtree.find(".gpme-comment-count-container");
  var $countBg = $container.find(".gpme-comment-count-bg");
  var $countFg = $container.find(".gpme-comment-count-fg");

  // Clear any old timers we may have
  if (id in lastCommentCountUpdateTimers) {
    clearTimeout(lastCommentCountUpdateTimers[id]);
    delete lastCommentCountUpdateTimers[id];
  }

  // Change background of count
  var seenCount = localStorage.getItem('gpme_post_seen_comment_count_' + id);
  // seenCount === null && count > 0 : in list mode, there is no seen count on new folded posts
  // seenCount !== null && count != seenCount : count has changed since last seen
  // 'gpme_post_seen_comment_count_changed_' + id in localStorage : count is the same but was
  //    different before, which means e.g. a comment was deleted and another inserted
  if ((seenCount === null && count > 0 ) || (seenCount !== null && count != seenCount) ||
      'gpme_post_seen_comment_count_changed_' + id in localStorage) {
    $countBg.removeClass(C_COMMENTCOUNT_NOHILITE);
    $countFg.removeClass(C_COMMENTCOUNT_NOHILITE);
    $countFg.text(count - (seenCount !== null ? seenCount : 0));
    $container.show();

    // Keep track of comment count changes, so that "0" stays red (when
    // someone deletes a comment)
    if (seenCount !== null && ! ('gpme_post_seen_comment_count_changed_' + id in localStorage)) {
      lastCommentCountUpdateTimers[id] = setTimeout(function() {
        debug("lastCommentCountUpdateTimers: setting id=" + id);
        localStorage['gpme_post_seen_comment_count_changed_' + id] = true;
        delete lastCommentCountUpdateTimers[id];
      }, 200);
    }
  } else {
    $countBg.addClass(C_COMMENTCOUNT_NOHILITE);
    $countFg.addClass(C_COMMENTCOUNT_NOHILITE);
    if (count) {
      $countFg.text(count);
      $container.show();
    } else {
      $container.hide();
    }
  }
}

/**
 * Update the summary of comments with names of commenters.
 * NOTE: due to the way Google orders the names (oldest to most recent)
 * and cuts off past a number of names, we have to stick to that order.
 */
function updateCommentsSnippet(id, $subtree) {
  var text = '';
  var $snippet = $subtree.find('.gpme-comments-snippet');

  // Get the shown names
  var names = new Array();
  var namesHash = new Object();

  function addNameUnique(name) {
    if (typeof namesHash[name] == 'undefined') {
      names.push(name);
      namesHash[name] = true;
    }
  }

  var $shownNames = $subtree.find(_C_COMMENTS_SHOWN_NAMES);
  $shownNames.each(function() { addNameUnique($(this).text()); });
  // Pad with some more recent names
  if (names.length < 7) {
    var $moreNames = $subtree.find(_C_COMMENTS_MORE_NAMES);
    $moreNames.each(function() { addNameUnique($(this).text()); });
  }
  text = names.join(', ');

  var $oldNames = $subtree.find(_C_COMMENTS_OLD_NAMES);
  if ($oldNames.length) {
    // If nothing, then just get the old names.
    if (! text.match(/\S/))
      text = $oldNames.text();
    else
      text = '…, ' + text;
  }
  $snippet.text(text);
}

/**
 * Update the commentbar's height
 * @param commentCount Optionally provide the commentcount
 */
function updateCommentbarHeight(id, $item, commentCount) {
  // Skip it since the entire post is not even shown
  if ($item.hasClass('gpme-folded'))
    return;

  var $commentbar = $item.find('.gpme-commentbar > div');

  if (typeof commentCount == 'undefined')
    commentCount = countComments($item);

  // If no comments, no need for a bar
  if (commentCount === 0) {
    $commentbar.hide();
  } else {
    $commentbar.show();
    // If folded, Remove any dynamically-set height
    if ($item.hasClass('gpme-comments-folded')) {
      $commentbar.css('height', '');
    } else {
      // Update the height
      var $commentWrapper = $item.find('.gpme-comments-wrapper');
      if (! $commentWrapper.length) {
        error("updateCommentbarHeight: can't find comments wrapper");
        error($item);
      } else {
        // Despite advertisements, jQuery 1.6.2 still cannot calculate
        // height within a hidden tree
        $commentbar.height($commentWrapper.actual('outerHeight') - 2);
      }
    }
  }
}

/** 
 * Count comments for item
 */
function countComments($subtree) {
  var commentCount = 0;
  var $oldComments = $subtree.find(_C_COMMENTS_OLD);
  if ($oldComments.length)
    commentCount += parseInt($oldComments.text(), 10);
  commentCount += countShownComments($subtree);
  var $moreComments = $subtree.find(_C_COMMENTS_MORE);
  if ($moreComments.length)
    commentCount += parseInt($moreComments.text(), 10);

  //debug("countComments: " + commentCount);
  return commentCount;
}

/**
 * Returns the number of shown comments
 */
function countShownComments($subtree) {
  return $subtree.find(_C_COMMENTS_SHOWN).length;
}

/**
 * Stores seen comment count
 */
function saveSeenCommentCount(id, commentCount) {
  debug("saveSeenCommentCount: id=" + id + " saving count=" + commentCount);
  // Update the shown comment count, only if not already set.
  var oldCount = localStorage.getItem('gpme_post_seen_comment_count_' + id);
  if (typeof(oldCount) == 'undefined' || oldCount === null)
    localStorage.setItem('gpme_post_seen_comment_count_' + id, commentCount);
}

/**
 * Deletes seen comment count
 */
function deleteSeenCommentCount(id) {
  // Remove the stored comment count
  localStorage.removeItem('gpme_post_seen_comment_count_' + id);
  localStorage.removeItem('gpme_post_seen_comment_count_changed_' + id);
}

/****************************************************************************
 * Preview popup
 ***************************************************************************/

function showPreview(e) {
  //debug("showPreview: this=" + this.className);

  // Skip if this is expanded mode
  if (displayMode == 'expanded')
    return;

  // Sometimes if you switch windows, there might be some preview remaining
  // that hoverIntent will not catch.
  if ($lastPreviewedItem)
    hidePostItemPreview($lastPreviewedItem);

  var $item = $(this);

  var $post = $item.find('.gpme-post-wrapper');
  if ($post.length) {
    // Block clicks temporarily
    var $clickWall = $item.find('.gpme-disable-clicks');
    $clickWall.show();
    setTimeout(function() { $clickWall.hide(); } , clickWallTimeout);

    $post.show();
    $lastPreviewedItem = $item;

    // Detect fixed topbar for compatibility (from "Replies and more for Google+")
    var $topbar = $('#gb');
    var isTopbarFixed = $topbar.length && ($topbar.parent().css('position') == 'fixed');

    // Move to the right edge and as far up as possible
    // 430px = (31+60+26) cropping + 135 shriking + 195 width of sidebar - 17 slack
    // NOTE: need lots of slack coz the horizontal scrollbar flashes on OSX for some rason
    //$post.css('left',
      //'' + (430 + Math.max(0, Math.floor((document.body.clientWidth - 960) / 2))) + 'px');
    $post.css('left', '0');
    // We give slack of 10 coz otherwise you get the horizontal bar flashing on Chrome OSX.
    // The width of the popup is reduced by 5 in CSS to leave a bit of a gap between posts and the popup so
    // that the popup triangle can nicely overlay a big commentcount.
    $post.css('right', '' +
      -Math.min($post.outerWidth() + 5,
        ($(document).width() - $(window).scrollLeft() - $item.get(0).getBoundingClientRect().right - 10)) +
      'px');
    $post.css('left', 'auto');
    // Move to the top, leaving room for the top bar
    // NOTE: first '30' is the height of triangle; second '30' is height of Google status bar.
    var offsetY = Math.max(/* post-wrapper's padding-top */ 6,
      Math.min($post.outerHeight() - /* height of triangle */ 30 - /* post-wrapper's padding-bottom */ 6,
        $item.offset().top -
        (isTopbarFixed ? document.body.scrollTop + 30 :
            Math.max(document.body.scrollTop, /* height of Google statusbar */ 30 )) - /* breathing room */ 7));
    $post.css('top', '' + (-offsetY) + 'px');
    //$post.css('max-height', '' + (window.innerHeight - 14) + 'px');
    var $triangle = $item.find('.gpme-preview-triangle');
    $triangle.css('top',  '' + offsetY + 'px');
  } else {
    error("showPreview: Can't find post wrapper");
    error($item);
  }
}

function hidePreview(e) {
  //debug("hidePreview: this=" + this.className);
  hidePostItemPreview($(this));
}

function hidePostItemPreview($item) {
  if (!$item || ! $item.hasClass("gpme-folded"))
    return;

  var $post = $item.find('.gpme-post-wrapper');
  if ($post.length) {
    $post.hide();
  } else {
    error("showPreview: Can't find post wrapper");
    error($item);
  }

  $lastPreviewedItem = null;
}

/****************************************************************************
 * Main
 ***************************************************************************/

$(document).ready(function() {
  trace("event: initial page load.");

  injectCSS();
  
  // Get options and then modify the page
  getOptionsFromBackground(function() {
    // Listen for when there's a total AJAX refresh of the stream,
    // on a regular page
    var $contentPane = $(_ID_CONTENT_PANE);
    if ($contentPane.length) {
      var contentPane = $contentPane.get(0);
      $contentPane.bind('DOMNodeInserted', function(e) {
        // This happens when a new stream is selected
        if (e.relatedNode.parentNode == contentPane)
          return onContentPaneUpdated(e);

        var id = e.target.id;
        // ':' is weak optimization attempt for comment editing
        if (id && ! id.charAt(0))
          return;

        // This happens when a new post is added, either through "More"
        // or a new recent post.
        if (id && id.indexOf('update-') === 0)
          onStreamUpdated(e);
        // This happens when switching from About page to Posts page
        // on profile
        else if (e.relatedNode.id.indexOf('-posts-page') > 0)
          onContentPaneUpdated(e);
      });
    } else  {
      error("main: Can't find content pane");
    }

    // Listen when status change
    // WARNING: DOMSubtreeModified is deprecated and degrades performance:
    //   https://developer.mozilla.org/en/Extensions/Performance_best_practices_in_extensions
    var $status = $(_ID_STATUS_FG);
    if ($status.length)
      $status.bind('DOMSubtreeModified', onStatusUpdated);
    else
      debug("main: Can't find status node");

    // Listen to incoming messages from background page
    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
      if (request.action == "gpmeTabUpdateComplete") {
        // Handle G+'s history state pushing when user clicks on different streams (and back)
        onTabUpdated();
      } else if (request.action == "gpmeModeOptionUpdated") {
        // Handle options changes
        onModeOptionUpdated(request.mode);
      } else if (request.action == "gpmeResetAll") {
        onResetAll();
      }
    });

    injectNewFeedbackLink();

    // The initial update
    if (isEnabledOnThisPage())
      updateAllItems();
  });
});

// vim:set iskeyword+=-,36:
