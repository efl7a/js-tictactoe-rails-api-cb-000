class GamesController < ApplicationController
  before_action :set_game, only: [:show, :update]

  def index
    games = Game.all
    render json: games
  end

  def show
    render json: @game
  end

  def create
    binding.pry
    game = Game.create(state: JSON.parse(params["state"]))
    render json: game, status: 201
  end

  def update
    @game.update(state: JSON.parse(params["state"]))
    render json: @game
  end

  private

  def game_params
    params.permit(state: [])
  end

  def set_game
    @game = Game.find(params[:id])
  end
end
