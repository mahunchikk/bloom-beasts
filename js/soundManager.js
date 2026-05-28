class SoundManager {
    constructor() {
        this.sounds = {
            music: {
                game:   null,
                battle: null,
            },
            sfx: {
                big:   null,
                small: null,
            }
        };

        this.currentMusic     = null;
        this.currentMusicType = null;

        this.musicVolume = 0.5;
        this.sfxVolume   = 0.7;
        this.isMuted     = false;
    }

    async loadAllSounds() {
        this.sounds.music.game   = this.createAudio('sounds/music/game.ogg',   true);
        this.sounds.music.battle = this.createAudio('sounds/music/battle.ogg', true);
        this.sounds.sfx.big      = this.createAudio('sounds/sfx/big.mp3',      false);
        this.sounds.sfx.small    = this.createAudio('sounds/sfx/small.mp3',    false);

        Object.values(this.sounds.music).forEach(a => a && a.load());
        Object.values(this.sounds.sfx).forEach(a => a && a.load());

        this.loadSettings();

        window.addEventListener('beforeunload', () => {
            this._saveCurrentTime();
        });
    }

    createAudio(src, loop = false) {
        const audio   = new Audio(src);
        audio.loop    = loop;
        audio.preload = 'auto';
        return audio;
    }

    _saveCurrentTime() {
        if (this.currentMusic && this.currentMusicType) {
            sessionStorage.setItem(
                'musicTime_' + this.currentMusicType,
                this.currentMusic.currentTime
            );
            sessionStorage.setItem('musicType', this.currentMusicType);
        }
    }

    playMusic(type) {
        if (
            this.currentMusicType === type &&
            this.currentMusic &&
            !this.currentMusic.paused
        ) return;

        this.stopMusic();

        const newMusic = this.sounds.music[type];
        if (newMusic && this.musicVolume > 0 && !this.isMuted) {
            this.currentMusic     = newMusic;
            this.currentMusicType = type;
            newMusic.volume       = this.musicVolume;

            const savedTime = sessionStorage.getItem('musicTime_' + type);
            if (savedTime !== null) {
                newMusic.currentTime = parseFloat(savedTime);
            }

            newMusic.play().catch(e => console.log('Музыка заблокирована:', e));
            sessionStorage.setItem('musicType', type);
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            this._saveCurrentTime();
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic     = null;
            this.currentMusicType = null;
        }
    }

    toggleMusic() {
        if (!this.currentMusic) return;
        if (this.currentMusic.paused) {
            this.currentMusic.play();
        } else {
            this.currentMusic.pause();
        }
    }

    playSfx(soundName) {
        return new Promise(resolve => {
            const sound = this.sounds.sfx[soundName];
            if (!sound || this.sfxVolume <= 0 || this.isMuted) {
                resolve();
                return;
            }

            const clone  = sound.cloneNode();
            clone.volume = this.sfxVolume;

            let resolved = false;
            const done = () => {
                if (!resolved) { resolved = true; resolve(); }
            };

            clone.addEventListener('ended', done, { once: true });
            clone.addEventListener('error', done, { once: true });
            setTimeout(done, 500);

            clone.play().catch(done);
        });
    }

    async navigate(url, sfxName = 'big') {
        this._saveCurrentTime();
        await this.playSfx(sfxName);
        window.location.href = url;
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume / 100));
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
        this.saveSettings();
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume / 100));
        this.saveSettings();
    }

    muteAll() {
        this.isMuted = true;
        if (this.currentMusic) this.currentMusic.volume = 0;
        this.saveSettings();
    }

    unmuteAll() {
        this.isMuted = false;
        if (this.currentMusic) this.currentMusic.volume = this.musicVolume;
        this.saveSettings();
    }

    saveSettings() {
        localStorage.setItem('musicVolume', this.musicVolume * 100);
        localStorage.setItem('sfxVolume',   this.sfxVolume   * 100);
        localStorage.setItem('isMuted',     this.isMuted);
    }

    loadSettings() {
        const savedMusic = localStorage.getItem('musicVolume');
        const savedSfx   = localStorage.getItem('sfxVolume');
        const savedMuted = localStorage.getItem('isMuted');

        if (savedMusic !== null) this.musicVolume = savedMusic / 100;
        if (savedSfx   !== null) this.sfxVolume   = savedSfx   / 100;
        if (savedMuted !== null) this.isMuted      = savedMuted === 'true';

        if (this.currentMusic) {
            this.currentMusic.volume = this.isMuted ? 0 : this.musicVolume;
        }
    }
}

if (!window.soundManager) {
    window.soundManager = new SoundManager();
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.soundManager.sounds.music.game) {
        window.soundManager.loadAllSounds();
    }
    window.soundManager.loadSettings();
});