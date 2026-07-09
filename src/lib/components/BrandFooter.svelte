<script>
    const year = new Date().getFullYear();
</script>

<div class="footer">
  <div class="footer-content">
    <div class="footer-content__left">
      <div>
        <p>made with <span class="heart">♥</span> by <a href="https://www.d17e.dev" target="_blank">D17E</a></p>
        <p><a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank">© CC BY-NC 4.0</a>{" "}| {year} </p>
      </div>
    </div>
    <div class="footer-content__right">
      <span>KvK - 87650770</span>
      <span>BTW - NL004463884B92</span>
    </div>
  </div>
</div>

<style>
    a {
        border-style: dashed;
        border-bottom-width: 1px;
        border-color: hsl(var(--muted-foreground));
    }

    a:hover {
        border-color: var(--brand-magenta);
        color: var(--brand-magenta-strong);
    }

    .heart {
        color: var(--brand-magenta);
    }

    .footer {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem 0;
        font-family: 'argesta_regular', serif;
        color: hsl(var(--muted-foreground));
    }

    @media (max-width: 768px) {
        .footer-content {
            flex-direction: column;
            gap: .5rem;
        }

        .footer-content__left {
            text-align: center;
        }

        .footer-content__right {
            text-align: center;
        }
    }

    .footer-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 0 20px;
    }

    .footer-content__left {
        font-size: 0.8rem;
    }

    .footer-content__right {
        display: flex;
        flex-direction: column;
        font-size: 0.8rem;
    }
</style>
